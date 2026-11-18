"use client";

import ActivityCalendar from "react-activity-calendar";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import SectionHeader from "@/components/editorial/SectionHeader";

interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface Language {
  name: string;
  percent: number;
}

interface Repo {
  name: string;
  url: string | null;
  isPrivate: boolean;
  commits: number;
}

/* Bronze monochrome scale: from var(--ed-border) to var(--ed-accent) */
const bronzeScale = ["#2E2F31", "#46413A", "#6E5F45", "#8F7A50", "#A2895B"];
const bronzeScaleLight = ["#E3E1D9", "#CFC4AC", "#B49E72", "#9C8354", "#8A6F3F"];

/* Language bars fade by rank, echoing the bronze scale */
const barOpacity = [1, 0.8, 0.65, 0.5, 0.4];

const cardClass = "rounded-lg border border-[var(--ed-border)] bg-[var(--ed-bg-elevated)] p-6";
const cardLabelClass = "mb-5 text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]";

export default function GithubContribution() {
  const { t } = useTranslation();
  const [data, setData] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [topRepos, setTopRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github-contributions")
      .then((res) => res.json())
      .then((d) => {
        if (d.contributions) {
          setData(d.contributions);
          setTotal(d.total);
        }
        if (d.languages) setLanguages(d.languages);
        if (d.topRepos) setTopRepos(d.topRepos);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="border-b border-[var(--ed-border)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-24">
        <SectionHeader
          tag="GitHub"
          title={
            <>
              {t("github.title")}
              <em className="ed-accent-em">{t("github.title-1")}</em>
            </>
          }
          description={t("github.description")}
        />

        <div className={`${cardClass} md:p-9`}>
          <div className="flex justify-center overflow-x-auto">
            <Link href="https://github.com/faqihfnf" target="_blank" rel="noopener noreferrer">
              {loading ? (
                <ActivityCalendar data={[]} loading />
              ) : (
                <ActivityCalendar
                  data={data}
                  blockSize={12}
                  blockMargin={4}
                  fontSize={13}
                  theme={{
                    light: bronzeScaleLight,
                    dark: bronzeScale,
                  }}
                  labels={{
                    totalCount: `${total} contributions in the last year`,
                  }}
                  hideTotalCount={false}
                />
              )}
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className={`${cardClass} h-56 animate-pulse`} />
            <div className={`${cardClass} h-56 animate-pulse`} />
          </div>
        ) : (
          (languages.length > 0 || topRepos.length > 0) && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {languages.length > 0 && (
                <div className={cardClass}>
                  <h3 className={cardLabelClass}>{t("github.top-languages")}</h3>
                  <ul className="flex flex-col gap-4">
                    {languages.map((lang, i) => (
                      <li key={lang.name}>
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span>{lang.name}</span>
                          <span className="tabular-nums text-[var(--ed-text-muted)]">{lang.percent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--ed-border)]">
                          <div
                            className="h-full rounded-full bg-[var(--ed-accent)]"
                            style={{ width: `${lang.percent}%`, opacity: barOpacity[i] }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {topRepos.length > 0 && (
                <div className={cardClass}>
                  <h3 className={cardLabelClass}>{t("github.active-repos")}</h3>
                  <ul className="flex flex-col">
                    {topRepos.map((repo) => (
                      <li
                        key={repo.name}
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--ed-border)] py-3 text-sm last:border-b-0"
                      >
                        {repo.url ? (
                          <Link
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate transition-colors hover:text-[var(--ed-accent)]"
                          >
                            {repo.name}
                          </Link>
                        ) : (
                          <span className="flex min-w-0 items-center gap-1.5" title={t("github.private")}>
                            <span className="truncate">{repo.name}</span>
                            <Lock
                              className="size-3.5 shrink-0 text-[var(--ed-text-muted)]"
                              aria-label={t("github.private")}
                            />
                          </span>
                        )}
                        <span className="shrink-0 tabular-nums text-[var(--ed-text-muted)]">
                          {repo.commits} {t("github.commits")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}
