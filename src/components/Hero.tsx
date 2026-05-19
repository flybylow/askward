import Image from 'next/image';

/** Portrait collage — 571×1024 (9:16) */
const COLLAGE_WIDTH = 571;
const COLLAGE_HEIGHT = 1024;

export function Hero() {
  return (
    <section
      aria-label="Introduction"
      className="relative h-[85vh] overflow-hidden bg-bg-base"
    >
      {/*
        Full-size bleed: 110% hero height, width follows aspect ratio,
        anchored bottom-right. Clips at hero boundary.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 hidden aspect-[571/1024] md:block"
        style={{
          height: '110%',
          maxWidth: '48vw',
        }}
      >
        <Image
          src="/hero-collage.png"
          alt=""
          width={COLLAGE_WIDTH}
          height={COLLAGE_HEIGHT}
          priority
          className="size-full object-contain object-right-bottom"
          sizes="48vw"
        />
      </div>

      <div className="relative z-10 flex h-full max-w-[58%] flex-col justify-center px-6 md:pl-[10%] md:pr-6 lg:pl-[12%] lg:max-w-[54%]">
        <span className="mb-8 inline-flex w-fit rounded-full bg-border-divider px-3 py-1.5 text-[13px] text-text-primary">
          Ward · AI Agent Designer
        </span>

        <h1 className="text-hero-headline text-text-primary">
          <span className="block">Designing agents</span>
          <span className="block md:whitespace-nowrap">that work out of the box.</span>
        </h1>

        <p className="mt-6 text-hero-subhead text-text-muted md:whitespace-nowrap">
          Twenty years between customers and products.
        </p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 aspect-[571/1024] md:hidden"
        style={{
          height: '52%',
          maxWidth: '62vw',
        }}
      >
        <Image
          src="/hero-collage.png"
          alt=""
          width={COLLAGE_WIDTH}
          height={COLLAGE_HEIGHT}
          priority
          className="size-full object-contain object-right-bottom"
          sizes="62vw"
        />
      </div>
    </section>
  );
}
