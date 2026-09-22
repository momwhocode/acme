import { Avatar } from "./Avatar.jsx";
import { isUserAvatarEntity, resolveAvatarUser } from "../../lib/userAvatar.js";

/** Renders an avatar only for user entities (see `userAvatar.js`). */
export function UserAvatar({ user, size = "md", className = "", alt }) {
  if (!isUserAvatarEntity(user)) return null;

  const avatarUser = resolveAvatarUser(user);
  if (!avatarUser) return null;

  return (
    <Avatar
      type={avatarUser.avatarType === "image" ? "image" : "initials"}
      size={size}
      initials={avatarUser.initials}
      color={avatarUser.color}
      imageUrl={avatarUser.imageUrl}
      alt={alt ?? avatarUser.name ?? avatarUser.actor}
      className={className}
    />
  );
}
