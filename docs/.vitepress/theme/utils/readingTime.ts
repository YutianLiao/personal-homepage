/** Estimate reading time for mixed Chinese / English prose. */
export function estimateReadingMinutes(text: string, cpm = 420): number {
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, "");

  if (!stripped.length) return 1;
  return Math.max(1, Math.ceil(stripped.length / cpm));
}

export function formatReadingTime(minutes: number, lang = "zh-CN"): string {
  if (lang.startsWith("zh")) {
    return minutes < 60 ? `约 ${minutes} 分钟` : `约 ${Math.round((minutes / 60) * 10) / 10} 小时`;
  }
  return minutes < 60 ? `${minutes} min read` : `${Math.round((minutes / 60) * 10) / 10} hr read`;
}
