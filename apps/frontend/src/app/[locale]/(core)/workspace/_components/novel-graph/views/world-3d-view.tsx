"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

import { characterFactionColor } from "../character-fields";
import { relationshipColors } from "../relationship-colors";
import { useCharacters, useRelationships } from "../api";
import { useNovelGraphStore } from "../graph-store";

type ForceGraphInstance = {
  graphData: (data: unknown) => ForceGraphInstance;
  nodeLabel: (value: string | ((node: Record<string, unknown>) => string)) => ForceGraphInstance;
  nodeColor: (value: (node: Record<string, unknown>) => string) => ForceGraphInstance;
  nodeRelSize: (value: number) => ForceGraphInstance;
  nodeResolution: (value: number) => ForceGraphInstance;
  nodeThreeObject: (value: (node: Record<string, unknown>) => unknown) => ForceGraphInstance;
  linkLabel: (value: (link: Record<string, unknown>) => string) => ForceGraphInstance;
  linkColor: (value: (link: Record<string, unknown>) => string) => ForceGraphInstance;
  linkOpacity: (value: number) => ForceGraphInstance;
  linkCurvature: (value: (link: Record<string, unknown>) => number) => ForceGraphInstance;
  linkDirectionalArrowLength: (value: number) => ForceGraphInstance;
  linkDirectionalArrowRelPos: (value: number) => ForceGraphInstance;
  linkDirectionalParticles: (
    value: (link: Record<string, unknown>) => number,
  ) => ForceGraphInstance;
  linkDirectionalParticleColor: (
    value: (link: Record<string, unknown>) => string,
  ) => ForceGraphInstance;
  linkDirectionalParticleSpeed: (
    value: (link: Record<string, unknown>) => number,
  ) => ForceGraphInstance;
  linkDirectionalParticleWidth: (
    value: (link: Record<string, unknown>) => number,
  ) => ForceGraphInstance;
  linkWidth: (value: (link: Record<string, unknown>) => number) => ForceGraphInstance;
  backgroundColor: (value: string) => ForceGraphInstance;
  d3Force: (name: string, force?: unknown) => unknown;
  cooldownTicks: (value: number) => ForceGraphInstance;
  scene: () => import("three").Scene;
  lights: (value: import("three").Light[]) => ForceGraphInstance;
  zoomToFit: (duration?: number, padding?: number) => ForceGraphInstance;
  onNodeClick: (handler: (node: { id?: string }) => void) => ForceGraphInstance;
  onLinkClick: (handler: (link: { id?: string }) => void) => ForceGraphInstance;
  _destructor?: () => void;
};

type ThreeModule = typeof import("three");

function createTextSprite(THREE: ThreeModule, label: string, color: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Object3D();
  canvas.width = 512;
  canvas.height = 160;
  context.font = "600 44px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(2, 6, 23, 0.72)";
  context.roundRect(70, 34, 372, 72, 24);
  context.fill();
  context.strokeStyle = color;
  context.globalAlpha = 0.55;
  context.lineWidth = 3;
  context.stroke();
  context.globalAlpha = 1;
  context.fillStyle = "rgba(248, 250, 252, 0.96)";
  context.fillText(label.slice(0, 8), 256, 72);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(46, 14, 1);
  sprite.position.set(0, -13, 0);
  return sprite;
}

function createNodeObject(THREE: ThreeModule, node: Record<string, unknown>, fallback: string) {
  const color = String(node.color ?? "#67e8f9");
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 32, 32),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      roughness: 0.38,
      metalness: 0.25,
    }),
  );
  group.add(core);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(8.6, 32, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
  );
  group.add(halo);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(9.8, 0.28, 12, 72),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);

  group.add(createTextSprite(THREE, String(node.name ?? fallback), color));
  return group;
}

export function World3DView({ novelId }: { novelId?: string }) {
  const t = useTranslations("novelGraph");
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphInstance | null>(null);
  const { data: characters } = useCharacters(novelId);
  const { data: relationships } = useRelationships(novelId);
  const selectCharacter = useNovelGraphStore((state) => state.selectCharacter);
  const selectRelationship = useNovelGraphStore((state) => state.selectRelationship);
  const openInspector = useNovelGraphStore((state) => state.openInspector);

  const graphData = useMemo(
    () => ({
      nodes: characters.map((character) => ({
        id: character.id,
        name: character.name,
        color: characterFactionColor(character),
      })),
      links: relationships.map((relationship) => ({
        id: relationship.id,
        source: relationship.sourceId,
        target: relationship.targetId,
        name: relationship.label || t(`kinds.${relationship.kind}`),
        kind: relationship.kind,
        color: relationshipColors[relationship.kind],
        strength: relationship.strength,
        secret: relationship.isSecret,
      })),
    }),
    [characters, relationships, t],
  );

  useEffect(() => {
    let disposed = false;

    async function mount() {
      const container = containerRef.current;
      if (!container) return;
      const [forceGraphModule, THREE] = await Promise.all([
        import("3d-force-graph"),
        import("three"),
      ]);
      if (disposed) return;
      const ForceGraph3D = forceGraphModule.default as unknown as () => (
        element: HTMLElement,
      ) => ForceGraphInstance;
      graphRef.current = ForceGraph3D()(container);
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(900);
      for (let index = 0; index < starPositions.length; index += 3) {
        starPositions[index] = (Math.random() - 0.5) * 900;
        starPositions[index + 1] = (Math.random() - 0.5) * 620;
        starPositions[index + 2] = (Math.random() - 0.5) * 900;
      }
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      const stars = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
          color: "#c4b5fd",
          size: 0.9,
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
        }),
      );
      graphRef.current.scene().add(stars);
      graphRef.current.lights([
        new THREE.AmbientLight("#93c5fd", 1.8),
        new THREE.DirectionalLight("#f8fafc", 1.2),
        new THREE.PointLight("#a78bfa", 1.6, 420),
      ]);
      graphRef.current
        .backgroundColor("#020617")
        .nodeLabel((node) => String(node.name ?? t("world3d.unnamedCharacter")))
        .nodeColor((node) => String(node.color ?? "#67e8f9"))
        .nodeRelSize(5.5)
        .nodeResolution(32)
        .nodeThreeObject((node) => createNodeObject(THREE, node, t("world3d.unnamed")))
        .linkLabel((link) => String(link.name ?? t("world3d.unnamedRelationship")))
        .linkColor((link) => String(link.color ?? "#94a3b8"))
        .linkOpacity(0.64)
        .linkWidth((link) => 1.2 + Number(link.strength ?? 50) / 32)
        .linkCurvature((link) => (link.secret ? 0.34 : 0.16))
        .linkDirectionalParticles((link) => (link.secret ? 7 : 4))
        .linkDirectionalParticleColor((link) => String(link.color ?? "#94a3b8"))
        .linkDirectionalParticleSpeed((link) => 0.006 + Number(link.strength ?? 50) / 15000)
        .linkDirectionalParticleWidth((link) => (link.secret ? 4.4 : 3))
        .linkDirectionalArrowLength(4)
        .linkDirectionalArrowRelPos(1)
        .onNodeClick((node) => {
          selectCharacter(node.id);
          openInspector();
        })
        .onLinkClick((link) => {
          selectRelationship(link.id);
          openInspector();
        });
      const chargeForce = graphRef.current.d3Force("charge") as
        | { strength?: (value: number) => unknown }
        | undefined;
      chargeForce?.strength?.(-170);
      const linkForce = graphRef.current.d3Force("link") as
        | { distance?: (value: number) => unknown }
        | undefined;
      linkForce?.distance?.(105);
      graphRef.current.cooldownTicks(120);
      graphRef.current.graphData(graphData);
      requestAnimationFrame(() => graphRef.current?.zoomToFit(450, 80));
    }

    mount();

    return () => {
      disposed = true;
      graphRef.current?._destructor?.();
      graphRef.current = null;
    };
  }, [graphData, openInspector, selectCharacter, selectRelationship, t]);

  useEffect(() => {
    graphRef.current?.graphData(graphData);
    requestAnimationFrame(() => graphRef.current?.zoomToFit(450, 80));
  }, [graphData]);

  return (
    <div className="relative h-full min-h-0 bg-background">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
