import * as t from 'io-ts'
import { withFallback } from 'io-ts-types/lib/withFallback'
import faker from 'faker'
import _ from "lodash";
import moment, { isMoment } from "moment";
import {Errors} from "io-ts";
import { Either, isRight, right, isLeft, left, map} from "fp-ts/Either";

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


export const FieldCommon = {
  display : t.string,
  name    : t.string,
  required: withFallback(t.boolean, true)
}

export const DateField = t.type({
  ...FieldCommon,
  type    : t.literal("date"),
  format  : t.string,
  value   : t.union([t.string, t.undefined]),
  generate: t.union([t.boolean, t.undefined])
})

export const SelectItem = t.type({
  display: t.string,
  name   : t.string,
})

export const SelectMultiField = t.type({
  ...FieldCommon,
  type     : t.literal("select-multi"),
  items    : t.array(SelectItem),
  value    : t.union([t.array(t.string), t.undefined]),
  creatable: withFallback(t.boolean, true),
  generate : t.union([t.boolean, t.undefined])
})

export const SelectField = t.type({
  ...FieldCommon,
  type     : t.literal("select"),
  items    : t.array(SelectItem),
  value    : t.union([t.string, t.undefined]),
  creatable: withFallback(t.boolean, true),
  generate : t.union([t.boolean, t.undefined])
})

export const BooleanField = t.type({
  ...FieldCommon,
  type    : t.literal("boolean"),
  value   : t.union([t.boolean, t.undefined]),
  generate: t.union([t.boolean, t.undefined])
})

export const NumberField = t.type({
  ...FieldCommon,
  type    : t.literal("number"),
  value   : t.union([t.number, t.undefined]),
  generate: t.union([
    t.type({
      min      : t.number,
      max      : t.number,
      precision: t.number
    }),
    t.boolean,
    t.undefined
  ])
})

export const StringField = t.type({
  ...FieldCommon,
  type    : t.literal("string"),
  value   : t.union([t.string, t.undefined]),
  generate: withFallback(
    t.union([
      t.boolean,
      t.number,
      t.literal("name")
    ]),
    true
  )
})

interface ArrayFieldI {
  name    : string,
  display : string,
  type    : 'array',
  field   : FieldT,
  value   : Array<any>,
  generate: boolean
}

export const ArrayField = new t.Type<ArrayFieldI>(
  'array',
  (input: unknown): input is ArrayFieldI => {
    console.log("Type guard", input)
    if(_.isObject(input)) {
      return _.startsWith(_.get(input, 'type'), 'array(')
    } else {
      return false
    }
  },
  // `t.success` and `t.failure` are helpers used to build `Either` instances
  (input: unknown, context): Either<Errors, ArrayFieldI> => {
    // console.log("ArrayField.validate", input)
    const fieldObj = {
      display : _.get(input, "display"),
      name    : _.get(input, "name"),
      type    : _.replace(_.replace(_.get(input, "type"), "array(", ""), ")", ""),
      generate: _.get(input, "generate")
    }
    const values = _.get(input, "values")
    // console.log("Field obj", fieldObj)
    const field = Field.decode(fieldObj)

    // console.log("Field res", field)
    if(isRight(field) && _.isArray(values)) {
      return t.success({
        name   : field.right.name,
        display: field.right.display,
        type   : 'array',
        field  : field.right,
        value  : values,
        generate: _.get(input, "generate")
      })
    }

    return t.failure(input, context, `Failure trying to decode ArrayField [${input}]`)
  },
  // `A` and `O` are the same, so `encode` is just the identity function
  t.identity
)

export const Field = t.union([
  StringField,
  NumberField,
  BooleanField,
  SelectField,
  SelectMultiField,
  DateField,
  ArrayField
])

export type FieldT = t.TypeOf<typeof Field>

export const FieldFunctions = {
  generate: (field: FieldT): FieldT => {
    switch(field.type) {
      case "string":
        let strValue: string | undefined = undefined
        if(typeof field.generate === "number") {
          strValue = faker.random.alpha({count: field.generate, upcase: false})
        } else if(field.generate === "name") {
          strValue = faker.name.firstName()
        } else if(field.generate) {
          strValue = faker.random.alpha({count: 10, upcase: false})
        }
        return {
          ...field,
          value: strValue
        }
      case "number":
        let numValue: number | undefined = undefined
        if(typeof field.generate === 'object' && 'min' in field.generate) {
          numValue = faker.random.float({
            min      : field.generate.min,
            max      : field.generate.max,
            precision: field.generate.precision
          })
        } else if(field.generate) {
          numValue = faker.random.float()
        }
        return {
          ...field,
          value: numValue
        }
      case "boolean":
        return {
          ...field,
          value: faker.random.boolean()
        }
      case "select":
        return {
          ...field,
          value: faker.helpers.randomize(_.map(field.items, "name"))
        }
      case "select-multi":
        const num = faker.random.number(field.items.length)
        return {
          ...field,
          value: _.take(faker.helpers.shuffle(_.map(field.items, "name")), num)
        }
      case "date":
        return {
          ...field,
          value: moment(faker.date.past()).format(field.format)
        }
      case "array":
        return field
    }
  },
  setValue: (field: FieldT, value: any): FieldT => {
    switch (field.type) {
      case "string":
        if(_.isString(value)) {
          return { ...field, value }
        } else {
          return field
        }
      case "number":
        const num = _.toNumber(value)
        if(!_.isNaN(num)) {
          return {
            ...field,
            value: num
          }
        } else {
          return field
        }
      case "boolean":
        if(_.isBoolean(value)) {
          return { ...field, value }
        } else {
          return field
        }
      case "select":
        if(_.isString(value)) {
          return { ...field, value }
        } else {
          return field
        }
      case "select-multi":
        if(_.isArray(value)) {
          return { ...field, value }
        } else {
          return field
        }
      case "date":
        if(isMoment(value)) {
          return {
            ...field,
            value: value.format(field.format)
          }
        } else if(_.isString(value)) {
          return { ...field, value }
        } else {
          return field
        }
      case "array":
        return field
    }
  }
}

export const Request = t.type({
  url     : t.string,
  path    : t.string,
  location: FormLocation,
  method  : FormMethod,
  fields  : t.array(Field),
  root    : t.union([t.string, t.undefined])
})

export const Actions = t.type({
  display: t.string,
  path   : t.string,
  params : t.string
})

export const Form = t.type({
  request: Request,
  actions: t.union([t.array(Actions), t.undefined])
})

export const FormItem = t.type({
  display: t.string,
  name   : t.string,
  form   : Form
})

interface NavItem {
  display: string,
  name   : string,
  nav    : Array<Item>
}

type Item = t.TypeOf<typeof FormItem> | NavItem

export const NavItem: t.Type<NavItem> = t.recursion('NavItem', () =>
  t.type({
    display: t.string,
    name   : t.string,
    nav    : t.array(Item)
  })
)

export const Item = t.union([FormItem, NavItem])

export const Config = t.type({
  display : t.string,
  icon    : t.union([t.string, t.undefined]),
  settings: t.union([t.array(Field), t.undefined]),
  nav     : t.array(Item)
})