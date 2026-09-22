import { normalizeAvatarColor } from "../renderers/avatar.js";

const DEFAULT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%23c4cad4' width='32' height='32'/%3E%3Ccircle cx='16' cy='13' r='6' fill='%236a7282'/%3E%3Cellipse cx='16' cy='30' rx='10' ry='9' fill='%236a7282'/%3E%3C/svg%3E";

export function Avatar({
  type = "initial",
  size = "md",
  color = "orange",
  initials = "PS",
  src = null,
  imageUrl = null,
  alt = "",
  className = "",
}) {
  const resolvedColor = normalizeAvatarColor(color);
  const classes = [
    "april-avatar",
    `april-avatar--${size}`,
    type === "image" ? "april-avatar--image" : `april-avatar--${resolvedColor}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (type === "image") {
    return (
      <span className={classes}>
        <img
          className="april-avatar__image"
          src={src || imageUrl || DEFAULT_IMAGE}
          alt={alt || "Avatar"}
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span className={classes} role="img" aria-label={initials}>
      <span className="april-avatar__initials">{initials}</span>
    </span>
  );
}

export { AVATAR_COLORS, AVATAR_SIZES } from "../renderers/avatar.js";
