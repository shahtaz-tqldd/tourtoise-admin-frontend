const ConfigSectionHeading = ({ icon, title, description, badge }) => {
  const SectionIcon = icon;

  return (
    <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
        <SectionIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-slate-900">{title}</h2>
          {badge && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
};

export default ConfigSectionHeading;
