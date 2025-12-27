interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <div className="flex-1 h-[1px] bg-white/20" />
      <h3 className="text-white/90 tracking-[0.3em] text-sm px-4">
        {title}
      </h3>
      <div className="flex-1 h-[1px] bg-white/20" />
    </div>
  );
}
