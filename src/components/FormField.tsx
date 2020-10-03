import React from "react";
import * as t from 'io-ts'
import _ from 'lodash'
import { Field } from "../data/Types"
import {Form as ReactForm } from "react-bootstrap";

type BooleanFieldProps = {
  field   : t.TypeOf<typeof Field>,
  onChange: (s: any) => void
}

const BooleanField = (props: BooleanFieldProps) => {

  const [value, setValue] = React.useState<boolean>(
    typeof props.field.value === 'boolean' ?
      props.field.value :
      false
  )

  const onChange = (s: any): void => {
    console.log(s)
    if(_.isBoolean(s)) {
      setValue(s)
      props.onChange(s)
    }
  }

  return (
    <ReactForm.Group controlId={`form-basic-${props.field.name}`}>
      <ReactForm.Label className="font-weight-bold">{props.field.display}</ReactForm.Label>
      <ReactForm.Check
        type="checkbox"
        onChange={(e: any) => onChange(e.target.checked)}
        checked={value}
      />
    </ReactForm.Group>
  )
}

type NumberFieldProps = {
  field   : t.TypeOf<typeof Field>,
  onChange: (s: any) => void
}

const NumberField = (props: NumberFieldProps) => {

  const [value, setValue] = React.useState<number | undefined>(
    typeof props.field.value === 'number' ?
      props.field.value :
      undefined
  )

  const onChange = (s: string): void => {
    const num = _.toNumber(s)
    if(!_.isNaN(num)) {
      setValue(num)
      props.onChange(num)
    }
  }

  return (
    <ReactForm.Group controlId={`form-basic-${props.field.name}`}>
      <ReactForm.Label className="font-weight-bold">{props.field.display}</ReactForm.Label>
      <ReactForm.Control type="input" onChange={e => onChange(e.target.value)} value={value}/>
    </ReactForm.Group>
  )
}

type StringFieldProps = {
  field   : t.TypeOf<typeof Field>,
  onChange: (s: any) => void
}

const StringField = (props: StringFieldProps) => {

  const [value, setValue] = React.useState<string | undefined>(
    typeof props.field.value === 'string' ?
      props.field.value :
      undefined
  )

  const onChange = (s: string): void => {
    setValue(s)
    props.onChange(s)
  }

  return (
    <ReactForm.Group controlId={`form-basic-${props.field.name}`}>
      <ReactForm.Label className="font-weight-bold">{props.field.display}</ReactForm.Label>
      <ReactForm.Control type="input" onChange={e => onChange(e.target.value)} value={value}/>
    </ReactForm.Group>
  )
}

type FormFieldProps = {
  field   : t.TypeOf<typeof Field>,
  onChange: (key: string, value: any) => void
}

const FormField = (props: FormFieldProps) => {
  if(props.field.type === "string") {
    return (
      <StringField field={props.field} onChange={a => props.onChange(props.field.name, a)}/>
    )
  } else if(props.field.type === "number") {
    return (
      <NumberField field={props.field} onChange={a => props.onChange(props.field.name, a)}/>
    )
  } else if(props.field.type === "boolean") {
    return (
      <BooleanField field={props.field} onChange={a => props.onChange(props.field.name, a)}/>
    )
  }else {
    return (
      <div>Unknown field</div>
    )
  }
}

export default FormField