import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium cursor-pointer transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:m-0 [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-card hover:border-muted-foreground/50 hover:bg-card dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 py-1.5 has-[>svg]:px-2.5",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 rounded-md gap-1.5 px-2.5 has-[>svg]:px-2",
        lg: "h-9 rounded-md px-5 has-[>svg]:px-4",
        icon: "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SPINNER_COLOR: Record<string, string> = {
  default: "text-primary-foreground",
  destructive: "text-white",
  outline: "text-foreground",
  secondary: "text-secondary-foreground",
  ghost: "text-foreground",
  link: "text-primary",
}

/**
 * `loading` swaps the label for a spinner and blocks clicks. The label stays in the layout
 * (invisible), so the button keeps its width and nothing beside it shifts.
 *
 * A submit button inside a `<form action={fn}>` picks this up by itself from `useFormStatus`,
 * so those forms need no extra state. Forms that use `onSubmit` pass `loading` explicitly.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  const { pending } = useFormStatus()
  const busy = loading ?? (!asChild && props.type === "submit" && pending)
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={busy || undefined}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      // The label is hidden in place (transparent text, invisible child elements) rather than
      // wrapped, so `has-[>svg]` padding and the button's width stay exactly as they were.
      className={cn(
        buttonVariants({ variant, size, className }),
        busy && "relative text-transparent! disabled:opacity-80 [&>*:not([data-spinner])]:invisible"
      )}
      {...props}
    >
      {/* With asChild, Slottable marks the element to render; the spinner becomes its child. */}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      {busy && (
        <span data-spinner className={cn("absolute inset-0 grid place-items-center", SPINNER_COLOR[variant ?? "default"])} aria-hidden="true">
          <Loader2 className="animate-[spin-in_150ms_ease-out,spin_0.7s_linear_infinite]" />
        </span>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
