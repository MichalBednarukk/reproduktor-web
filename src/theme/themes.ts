export const themes = {
  classic: { bg:'from-[#0f1020] to-[#1a1d3a]', card:'bg-[#171b34]', primary:'bg-[#7C5CFF]', secondary:'bg-[#2DE2E6]', accent:'text-[#FF6B9A]' },
  pride: { bg:'from-[#111225] to-[#1B1A36]', card:'bg-[#1B1A36]', primary:'bg-[#5BCEFA]', secondary:'bg-[#F5A9B8]', accent:'text-white' },
  forest: { bg:'from-[#0E1711] to-[#15251A]', card:'bg-[#15251A]', primary:'bg-[#7ED957]', secondary:'bg-[#4CE0B3]', accent:'text-[#FFC857]' },
} as const
export type ThemeKey = keyof typeof themes

