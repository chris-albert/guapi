import React, { FunctionComponent } from "react";
import * as t from 'io-ts'
import _ from 'lodash'
import {
  Field,
  StringField as StringFieldType,
  NumberField as NumberFieldType,
  BooleanField as BooleanFieldType,
  SelectField as SelectFieldType,
  SelectMultiField as SelectMultiFieldType,
  DateField as DateFieldType,
  ArrayFieldI
} from "../data/Types"
import { Form as ReactForm, InputGroup, Button, Row, Col } from "react-bootstrap";
import Select from 'react-select'
import Creatable from 'react-select/creatable';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { Shuffle } from 'react-bootstrap-icons';

type ArrayFieldProps = {
  field: ArrayFieldI,
  onChange  : (s: any) => void,
  onGenerate: () => void
}

const ArrayField = (props: ArrayFieldProps) => {
  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={props.onGenerate}
      name={props.field.name}
      display={props.field.display}
      valid={false}
    >
      <div style={{
        flex: "1 1 auto"
      }}>
        Array
      </div>
    </GenericField>
  )
}

type DateFieldProps = {
  field     : t.TypeOf<typeof DateFieldType>,
  onChange  : (s: any) => void,
  onGenerate: () => void
}

const DateField = (props: DateFieldProps) => {

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={props.onGenerate}
      name={props.field.name}
      display={props.field.display}
      valid={false}
    >
      <div style={{
        flex: "1 1 auto"
      }}>
        <Datetime onChange={props.onChange} dateFormat={props.field.format} timeFormat={false} value={props.field.value} input={true}/>
      </div>
    </GenericField>
  )
}

type SelectMultiFieldProps = {
  field     : t.TypeOf<typeof SelectMultiFieldType>,
  onChange  : (s: any) => void,
  onGenerate: () => void
}

const SelectMultiField = (props: SelectMultiFieldProps) => {

  const options = _.map(props.field.items, item => {
    return {
      value: item.name,
      label: item.display
    }
  })

  const values = _.compact(_.map(options, opt => {
    const val =  _.find(props.field.value, v => opt.value === v)
    if(_.isUndefined(val)) {
      return undefined
    } else {
      return opt
    }
  }))

  const onChange = (s: any): void => {
    props.onChange(_.map(s, 'value'))
  }

  const element = !_.isUndefined(props.field.creatable) && props.field.creatable ?
    <Creatable options={options} onChange={onChange} value={values} isMulti={true}/> :
    <Select options={options} onChange={onChange} value={values} isMulti={true}/>

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={props.onGenerate}
      name={props.field.name}
      display={props.field.display}
      valid={false}
    >
      <div style={{
        flex: "1 1 auto"
      }}>
        {element}
      </div>
    </GenericField>
  )
}

type SelectFieldProps = {
  field     : t.TypeOf<typeof SelectFieldType>,
  onChange  : (s: any) => void,
  onGenerate: () => void
}

const SelectField = (props: SelectFieldProps) => {

  const options = _.map(props.field.items, item => {
    return {
      value: item.name,
      label: item.display
    }
  })

  const onChange = (s: any): void => {
    props.onChange(s.value)
  }

  const value = (() => {
    const v = _.find(options, i => i.value === props.field.value)
    if(props.field.creatable && _.isUndefined(v)) {
      return {
        value: props.field.value,
        label: props.field.value
      }
    }
    return v
  })()

  const element = props.field.creatable ?
    <Creatable options={options} onChange={onChange} value={value}/> :
    <Select options={options} onChange={onChange} value={value}/>

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={props.onGenerate}
      name={props.field.name}
      display={props.field.display}
      valid={false}
    >
      <div style={{
        flex: "1 1 auto"
      }}>
       {element}
      </div>
    </GenericField>
  )
}

type BooleanFieldProps = {
  field     : t.TypeOf<typeof BooleanFieldType>,
  onChange  : (s: any) => void,
  onGenerate: () => void
}

const BooleanField = (props: BooleanFieldProps) => {

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={props.onGenerate}
      name={props.field.name}
      display={props.field.display}
      valid={false}
    >
      <div className="mt-1 ml-2" style={{
        flex: "1 1 auto"
      }}>
        <ReactForm.Check
          type="switch"
          label=""
          onChange={(e: any) => props.onChange(e.target.checked)}
          checked={props.field.value}
        />
      </div>
    </GenericField>
  )
}

type NumberFieldProps = {
  field     : t.TypeOf<typeof NumberFieldType>,
  onChange  : (s: any) => void,
  onGenerate: () => void
}

const NumberField = (props: NumberFieldProps) => {

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={props.onGenerate}
      name={props.field.name}
      display={props.field.display}
      valid={false}
    >
      <ReactForm.Control type="input" onChange={e => props.onChange(e.target.value)} value={props.field.value}/>
    </GenericField>
  )
}

type StringFieldProps = {
  field     : t.TypeOf<typeof StringFieldType>,
  onChange  : (s: any) => void,
  onGenerate: () => void
}

const StringField = (props: StringFieldProps) => {

  return (
    <GenericField
      generate={!!props.field.generate}
      onGenerate={props.onGenerate}
      name={props.field.name}
      display={props.field.display}
      valid={true}
    >
      <ReactForm.Control type="input" onChange={e => props.onChange(e.target.value)} value={props.field.value}/>
    </GenericField>
  )
}

type GenericFieldProps = {
  generate   : boolean,
  onGenerate : () => void,
  name       : string,
  display    : string,
  valid      : boolean
}

const GenericField: FunctionComponent<GenericFieldProps> = (props) => {

  const labelClass = "" //props.valid ? "text-success" : "text-danger"

  return (
    <ReactForm.Group as={Row} controlId={`form-basic-${props.name}`}>
      <ReactForm.Label column sm={2} className={`font-weight-bold text-right ${labelClass}`}>{props.display}</ReactForm.Label>
      <Col sm={10}>
        <InputGroup size="sm">
            {props.children}
            {props.generate ?
              (<InputGroup.Append>
                <Button variant="secondary" onClick={props.onGenerate}><Shuffle/></Button>
              </InputGroup.Append>) : (<span></span>)
            }

        </InputGroup>
      </Col>
    </ReactForm.Group>
  )
}

type FormFieldProps = {
  field      : t.TypeOf<typeof Field>,
  onChange   : (key: string, value: any) => void,
  onGenerate?: (() => void)
}

const FormField = (props: FormFieldProps) => {

  const onGenerate = () => {
    if(!_.isUndefined(props.onGenerate)) {
      props.onGenerate()
    }
  }
  if(props.field.type === "string") {
    return (
      <StringField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        onGenerate={onGenerate}
      />
    )
  } else if(props.field.type === "number") {
    return (
      <NumberField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        onGenerate={onGenerate}
      />
    )
  } else if(props.field.type === "boolean") {
    return (
      <BooleanField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        onGenerate={onGenerate}
      />
    )
  } else if(props.field.type === "select") {
    return (
      <SelectField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        onGenerate={onGenerate}
      />
    )
  } else if(props.field.type === "select-multi") {
    return (
      <SelectMultiField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        onGenerate={onGenerate}
      />
    )
  } else if(props.field.type === "date") {
    return (
      <DateField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        onGenerate={onGenerate}
      />
    )
  } else if(props.field.type === "array") {
    return (
      <ArrayField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        onGenerate={onGenerate}
        />
    )
  } else {
    return (
      <div>Unknown field</div>
    )
  }
}

export default FormField