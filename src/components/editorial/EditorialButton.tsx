import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Editorial button — gaya outline tipis dengan aksen bronze.
 * Dipakai untuk CTA (Resume, Projects, dll.) di seluruh situs.
 */
const editorialButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border px-8 py-3 text-xs uppercase tracking-[0.18em] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ed-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ed-bg)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Aksen bronze — untuk CTA utama */
        primary: "border-[var(--ed-accent)] text-[var(--ed-text)] hover:bg-[var(--ed-accent)] hover:text-[var(--ed-bg)]",
        /** Bronze penuh — untuk aksi utama yang harus paling menonjol (mis. unduh ebook) */
        solid: "border-[var(--ed-accent)] bg-[var(--ed-accent)] text-[var(--ed-bg)] hover:opacity-85",
        /** Netral — untuk CTA sekunder */
        secondary: "border-[var(--ed-border)] text-[var(--ed-text)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)]",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

interface EditorialButtonProps extends React.ComponentProps<"button">, VariantProps<typeof editorialButtonVariants> {
  asChild?: boolean;
}

function EditorialButton({ className, variant, asChild = false, ...props }: EditorialButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="editorial-button" className={cn(editorialButtonVariants({ variant, className }))} {...props} />;
}

export { EditorialButton, editorialButtonVariants };
