"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AnswerValue } from "@/lib/agent/chat-types";
import type { AskQuestion, PendingQuestion } from "@/schemas/agent.schema";

interface AskUserProps {
  question: PendingQuestion;
  disabled: boolean;
  onAnswer: (answers: Record<string, AnswerValue>) => void;
  onDismiss: () => void;
}

function initialValue(question: AskQuestion): AnswerValue | undefined {
  if (question.type === "multiChoice") return [];
  return undefined;
}

export function AskUser({ question, disabled, onAnswer, onDismiss }: AskUserProps) {
  const t = useTranslations("chat.askUser");
  const initialAnswers = useMemo(
    () =>
      Object.fromEntries(
        question.questions
          .map((item) => [item.id, initialValue(item)])
          .filter(([, value]) => value !== undefined),
      ) as Record<string, AnswerValue>,
    [question],
  );
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(initialAnswers);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const complete = question.questions.every((item) => {
    if (!item.required) return true;
    const answer = answers[item.id];
    if (item.type === "multiChoice" && item.allowCustom && customAnswers[item.id]?.trim()) {
      return true;
    }
    return answer !== undefined && answer !== "" && (!Array.isArray(answer) || answer.length > 0);
  });

  const toggleMulti = (id: string, value: string, checked: boolean) => {
    setAnswers((current) => {
      const selected = Array.isArray(current[id]) ? current[id] : [];
      return {
        ...current,
        [id]: checked ? [...selected, value] : selected.filter((item) => item !== value),
      };
    });
  };

  return (
    <div className="px-4 pb-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle>{question.title}</CardTitle>
          {question.reason ? <CardDescription>{question.reason}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            {question.questions.map((item) => {
              const answer = answers[item.id];
              return (
                <fieldset key={item.id} className="flex min-w-0 flex-col gap-2">
                  <legend className="text-sm font-medium">{item.question}</legend>
                  <p className="text-xs text-muted-foreground">{item.header}</p>
                  {item.type === "text" ? (
                    <Input
                      value={typeof answer === "string" ? answer : ""}
                      placeholder={item.placeholder}
                      disabled={disabled}
                      onChange={(event) =>
                        setAnswers((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                    />
                  ) : null}
                  {item.type === "singleChoice" ? (
                    <div className="flex flex-wrap gap-2">
                      {item.options.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          size="sm"
                          variant={answer === option.value ? "default" : "outline"}
                          disabled={disabled}
                          title={option.description}
                          onClick={() =>
                            setAnswers((current) => ({ ...current, [item.id]: option.value }))
                          }
                        >
                          {option.label}
                        </Button>
                      ))}
                      {item.allowCustom ? (
                        <Input
                          value={
                            typeof answer === "string" &&
                            !item.options.some((option) => option.value === answer)
                              ? answer
                              : ""
                          }
                          placeholder={item.placeholder ?? t("custom")}
                          disabled={disabled}
                          onChange={(event) =>
                            setAnswers((current) => ({ ...current, [item.id]: event.target.value }))
                          }
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {item.type === "multiChoice" ? (
                    <div className="flex flex-col gap-2">
                      {item.options.map((option) => {
                        const selected = Array.isArray(answer)
                          ? answer.includes(option.value)
                          : false;
                        const inputId = `${item.id}-${option.value}`;
                        return (
                          <div key={option.value} className="flex items-start gap-2">
                            <Checkbox
                              id={inputId}
                              checked={selected}
                              disabled={disabled}
                              onCheckedChange={(checked) =>
                                toggleMulti(item.id, option.value, checked === true)
                              }
                            />
                            <Label htmlFor={inputId}>
                              {option.label}
                              {option.description ? (
                                <span className="block text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                              ) : null}
                            </Label>
                          </div>
                        );
                      })}
                      {item.allowCustom ? (
                        <Input
                          value={customAnswers[item.id] ?? ""}
                          placeholder={item.placeholder ?? t("custom")}
                          disabled={disabled}
                          onChange={(event) =>
                            setCustomAnswers((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {item.type === "confirm" ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={answer === true ? "default" : "outline"}
                        disabled={disabled}
                        onClick={() => setAnswers((current) => ({ ...current, [item.id]: true }))}
                      >
                        {t("confirm")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={answer === false ? "default" : "outline"}
                        disabled={disabled}
                        onClick={() => setAnswers((current) => ({ ...current, [item.id]: false }))}
                      >
                        {t("reject")}
                      </Button>
                    </div>
                  ) : null}
                </fieldset>
              );
            })}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" disabled={disabled} onClick={onDismiss}>
                {t("dismiss")}
              </Button>
              <Button
                type="button"
                disabled={disabled || !complete}
                onClick={() => {
                  const resolved = { ...answers };
                  for (const item of question.questions) {
                    const custom = customAnswers[item.id]?.trim();
                    if (item.type === "multiChoice" && custom) {
                      const current = resolved[item.id];
                      const selected = Array.isArray(current) ? current : [];
                      resolved[item.id] = [...selected, custom];
                    }
                  }
                  onAnswer(resolved);
                }}
              >
                {t("submit")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
