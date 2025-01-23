export function useDuplicate() {
  const route = useRoute()

  function parseValue(val?: string | null) {
    try {
      return JSON.parse(val ?? '')
    } catch (error) {
      return undefined
    }
  }

  const duplicate = computed(() => {
    const { duplicate, duplicateId } = route.query as Record<string, string>

    return {
      obj: parseValue(duplicate),
      id: parseValue(duplicateId),
    }
  })

  const hasDupe = computed(() => !!duplicate.value.obj || !!duplicate.value.id)

  async function dupe(
    initialObj: MaybeRefOrGetter<IItem>,
    options?: {
      /**
       * Should be one of the `Prisma` methods (`findOne`, `findFirst`)
       */
      fnc?: (...args: any) => Promise<any>
    },
  ) {
    const { fnc } = options ?? {}
    const { obj, id } = duplicate.value

    const value = obj
      ?? (id
        ? await fnc?.({ args: { where: { id } } })
        : undefined
      )

    if (!value) {
      return
    }

    const _initialObj = toValue(initialObj)
    const keys = Object.keys(_initialObj)

    keys.forEach(key => {
      _initialObj[key] = value[key] ?? _initialObj[key]
    })

    navigateTo({
      query: {
        ...route.query,
        duplicate: undefined,
        duplicateId: undefined,
      },
      replace: true,
    })
  }

  return { duplicate, hasDupe, dupe }
}
