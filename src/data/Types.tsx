import * as t from 'io-ts'

export const FieldType = t.union([
  t.literal("string"),
  t.literal("number")
])

export const FormLocation = t.union([
  t.literal("query"),
  t.literal("body")
])

export const FormMethod = t.union([
  t.literal("get"),
  t.literal("post"),
  t.literal("put"),
  t.literal("delete")
])

export const Field = t.type({
  display    : t.string,
  name       : t.string,
  type       : FieldType,
  value      : t.unknown,
  placeholder: t.union([t.string, t.undefined])
})

export const Interaction = t.type({
  display : t.string,
  name    : t.string,
  url     : t.string,
  path    : t.string,
  location: FormLocation,
  method  : FormMethod,
  fields  : t.array(Field)
})

export const Config = t.type({
  interactions: t.array(Interaction)
})