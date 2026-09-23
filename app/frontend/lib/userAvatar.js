import { avatarColorForId } from "../april/renderers/avatar.js"

export const USER_ENTITY_TYPE = "user"

export function isUserAvatarEntity(entity) {
  if (!entity || typeof entity !== "object") return false
  if (entity.showAvatar === false) return false
  if (entity.entityType === "system" || entity.actorType === "system") return false
  if (entity.entityType === USER_ENTITY_TYPE || entity.actorType === "user" || entity.showAvatar === true) {
    return true
  }
  return Boolean(entity.name || entity.initials || entity.imageUrl || entity.avatarUrl)
}

export function withUserEntityType(user) {
  if (!user || typeof user !== "object") return user
  return { ...user, entityType: USER_ENTITY_TYPE }
}

function rawAvatarUrl(entity) {
  return entity?.imageUrl ?? entity?.profilePhotoUrl ?? entity?.photoUrl ?? entity?.avatarUrl ?? entity?.src ?? ""
}

export function resolveAvatarUser(entity) {
  if (!entity || typeof entity !== "object") return null

  const resolved = String(rawAvatarUrl(entity)).trim()
  const colorSeed = entity.id || entity.email || entity.name

  return {
    ...withUserEntityType(entity),
    imageUrl: resolved,
    src: resolved,
    avatarType: resolved ? "image" : entity.avatarType || "initials",
    color: entity.color || avatarColorForId(colorSeed),
  }
}
