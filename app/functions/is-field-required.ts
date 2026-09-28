import type { Type } from 'arktype'
import type { z } from 'zod'
import { toRaw } from 'vue'

export type SchemaType = Type | z.ZodType

/**
 * Check if a schema is a Zod schema
 */
export function isZodSchema(schema: SchemaType): schema is z.ZodType {
  // Use toRaw to unwrap Vue proxy before checking internal properties
  const raw = toRaw(schema)

  return 'parse' in raw && 'safeParse' in raw && typeof raw.parse === 'function'
}

/**
 * Check if a schema is an ArkType schema
 */
export function isArkTypeSchema(schema: SchemaType): schema is Type {
  const raw = toRaw(schema)
  return 'internal' in raw && typeof raw === 'function'
}

// ============================================================================
// Zod helpers
// ============================================================================

// Zod 4 schemas expose their kind as `type`; wrappers expose `unwrap()`.
// Reading those instead of `instanceof` keeps Zod out of pages without schemas.
const ZOD_WRAPPER_TYPES = new Set(['optional', 'nullable', 'default'])

function zodKind(schema: z.ZodType) {
  return (schema as { type?: string }).type
}

/**
 * Unwrap a Zod schema from Vue proxy and any Zod wrappers (Optional, Nullable, Default)
 * Returns the innermost non-wrapper schema
 */
function unwrapZodSchema(schema: z.ZodType): z.ZodType {
  // First unwrap Vue proxy
  let unwrapped = toRaw(schema)

  // Then unwrap Zod wrappers (Optional, Nullable, Default)
  while (ZOD_WRAPPER_TYPES.has(zodKind(unwrapped) ?? '')) {
    // Access the unwrapped property which exists on these wrapper types
    unwrapped = toRaw((unwrapped as z.ZodOptional<z.ZodType>).unwrap())
  }

  return unwrapped
}

/**
 * Gets the Zod schema at a given path within a parent schema
 * Supports nested paths like "address.city"
 */
function getZodSchemaAtPath(schema: z.ZodType, path: string): z.ZodType | undefined {
  const pathParts = path.split('.')
  let currentSchema: z.ZodType | undefined = toRaw(schema)

  for (const part of pathParts) {
    if (!currentSchema) {
      return undefined
    }

    // Unwrap optional/nullable/default wrappers to get to the inner type
    const unwrapped = unwrapZodSchema(currentSchema)

    // Handle ZodObject - get field from shape
    if (zodKind(unwrapped) === 'object') {
      const fieldSchema = (unwrapped as z.ZodObject).shape[part]
      currentSchema = fieldSchema ? toRaw(fieldSchema) : undefined
    }
    // Handle ZodArray - for numeric indices, get the element schema
    else if (zodKind(unwrapped) === 'array' && !Number.isNaN(Number(part))) {
      currentSchema = toRaw((unwrapped as z.ZodArray).element) as z.ZodType
    }
    else {
      return undefined
    }
  }

  return currentSchema
}

function isZodFieldRequired(payload: { path: string, schema: z.ZodType }): boolean {
  const { path, schema } = payload

  const fieldSchema = getZodSchemaAtPath(toRaw(schema), path)

  if (!fieldSchema) {
    // If we can't find the schema at path, assume required
    return true
  }

  return !toRaw(fieldSchema).safeParse(undefined).success
}

// ============================================================================
// ArkType helpers
// ============================================================================

function isArkTypeFieldRequired(payload: { path: string, schema: Type }): boolean {
  const { path, schema } = payload
  const rawSchema = toRaw(schema)
  const internal = rawSchema.internal

  // For object types, check if path is in optionalKeys
  if ('structure' in internal && internal.structure) {
    const structure = internal.structure as { optionalKeys?: string[] }

    return !structure.optionalKeys?.includes(path)
  }

  return true
}

// ============================================================================
// Generic function
// ============================================================================

/**
 * Check if a field is required in a schema (supports both ArkType and Zod)
 */
export function isFieldRequired(payload: {
  path: string
  schema: SchemaType
}): boolean {
  const { path, schema } = payload

  if (isZodSchema(schema)) {
    return isZodFieldRequired({ path, schema })
  }

  if (isArkTypeSchema(schema)) {
    return isArkTypeFieldRequired({ path, schema })
  }

  // Fallback: assume required if schema type is unknown
  return true
}
