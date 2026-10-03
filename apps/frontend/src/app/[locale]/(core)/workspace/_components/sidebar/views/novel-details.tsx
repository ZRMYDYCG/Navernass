"use client";

import { useMutation } from "@tanstack/react-query";
import { BookIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { Novel } from "@/lib/http/modules/library.schema";
import { uploadFile } from "@/lib/http/modules/storage.api";
import { imageContentTypes } from "@/lib/http/modules/storage.schema";
import { useCreateNovel, useUpdateNovel } from "@/servers/library.server";

interface NovelDetailsProps {
  novel: Novel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovelDetails({ novel, open, onOpenChange }: NovelDetailsProps) {
  const t = useTranslations("sidebar.novelDetails");
  const updateNovel = useUpdateNovel(novel.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <NovelForm
          novel={novel}
          pending={updateNovel.isPending}
          error={updateNovel.error}
          submitLabel={t("save")}
          onSubmit={(payload) =>
            updateNovel.mutate(payload, { onSuccess: () => onOpenChange(false) })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

interface NewNovelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (novel: Novel) => void;
}

export function NewNovel({ open, onOpenChange, onCreated }: NewNovelProps) {
  const t = useTranslations("sidebar.novelDetails");
  const createNovel = useCreateNovel();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <NovelForm
          pending={createNovel.isPending}
          error={createNovel.error}
          submitLabel={t("create")}
          onSubmit={(payload) =>
            createNovel.mutate(
              { ...payload, tags: [] },
              {
                onSuccess: (novel) => {
                  onOpenChange(false);
                  onCreated(novel);
                },
              },
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}

/** 弹窗每次打开都会重新挂载，表单状态从传入的小说初始化；不传则为空白表单。 */
function NovelForm({
  novel,
  pending,
  error,
  submitLabel,
  onSubmit,
}: {
  novel?: Novel;
  pending: boolean;
  error: Error | null;
  submitLabel: string;
  onSubmit: (payload: { title: string; description: string; cover: string }) => void;
}) {
  const t = useTranslations("sidebar.novelDetails");
  const [cover, setCover] = useState(novel?.cover ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadCover = useMutation({ mutationFn: uploadFile, onSuccess: setCover });
  const shownError = uploadCover.error ?? error;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit({
          title: String(data.get("title") ?? "").trim(),
          description: String(data.get("description") ?? "").trim(),
          cover,
        });
      }}
    >
      <FieldGroup>
        <div className="flex items-end gap-4">
          {cover ? (
            // oxlint-disable-next-line nextjs/no-img-element -- 封面可能是任意外链，无法预先配置 next/image 的域名白名单。
            <img src={cover} alt="" className="aspect-3/4 w-24 rounded-md object-cover" />
          ) : (
            <span className="flex aspect-3/4 w-24 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <BookIcon className="size-6" />
            </span>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadCover.isPending}
              onClick={() => fileInput.current?.click()}
            >
              {uploadCover.isPending ? <Spinner /> : null}
              {t("uploadCover")}
            </Button>
            {cover ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setCover("")}>
                {t("removeCover")}
              </Button>
            ) : null}
            <input
              ref={fileInput}
              type="file"
              accept={imageContentTypes.join(",")}
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                // 清空后再次选择同一文件也能触发 change。
                event.target.value = "";
                if (file) uploadCover.mutate(file);
              }}
            />
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="novel-title">{t("fields.title")}</FieldLabel>
          <Input
            id="novel-title"
            name="title"
            defaultValue={novel?.title}
            required
            maxLength={255}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="novel-description">{t("fields.description")}</FieldLabel>
          <Textarea
            id="novel-description"
            name="description"
            defaultValue={novel?.description ?? ""}
            maxLength={20_000}
            rows={4}
          />
        </Field>
        {shownError ? <FieldError>{shownError.message}</FieldError> : null}
      </FieldGroup>
      <DialogFooter className="mt-4">
        <DialogClose render={<Button type="button" variant="outline" />}>{t("cancel")}</DialogClose>
        <Button type="submit" disabled={uploadCover.isPending || pending}>
          {pending ? <Spinner /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
