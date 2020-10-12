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
  FieldFunctions
} from "../data/Types"
import { Form as ReactForm, InputGroup, Button, Row, Col } from "react-bootstrap";
import Select from 'react-select'
import Creatable from 'react-select/creatable';
import Datetime from 'react-datetime';
import moment, { Moment, isMoment } from "moment";
import "react-datetime/css/react-datetime.css";
import { Shuffle } from 'react-bootstrap-icons';
import faker from 'faker'

type DateFieldProps = {
  field   : t.TypeOf<typeof DateFieldType>,
  onChange: (s: string) => void,
  doGenerate?: boolean | null
}

const DateField = (props: DateFieldProps) => {

  const onChange = (s: Moment | string): void => {
    if(isMoment(s)) {
      props.onChange(s.format(props.field.format))
    } else {
      props.onChange(s)
    }
  }

  const generate = () => {
    onChange(moment(faker.date.past()))
  }

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={generate}
      name={props.field.name}
      display={props.field.display}
      doGenerate={props.doGenerate}
      valid={false}
    >
      <div style={{
        flex: "1 1 auto"
      }}>
        <Datetime onChange={onChange} dateFormat={props.field.format} timeFormat={false} value={props.field.value} input={true}/>
      </div>
    </GenericField>
  )
}

type SelectMultiFieldProps = {
  field   : t.TypeOf<typeof SelectMultiFieldType>,
  onChange: (s: Array<string>) => void,
  doGenerate?: boolean | null
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

  const generate = () => {
    const num = faker.random.number(options.length)
    onChange(_.take(faker.helpers.shuffle(options), num))
  }

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={generate}
      name={props.field.name}
      display={props.field.display}
      doGenerate={props.doGenerate}
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
  field   : t.TypeOf<typeof SelectFieldType>,
  onChange: (s: string) => void,
  doGenerate?: boolean | null
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

  const generate = () => {
    onChange(faker.helpers.randomize(options))
  }

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={generate}
      name={props.field.name}
      display={props.field.display}
      doGenerate={props.doGenerate}
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
  field   : t.TypeOf<typeof BooleanFieldType>,
  onChange: (s: boolean) => void,
  doGenerate?: boolean | null
}

const BooleanField = (props: BooleanFieldProps) => {

  const onChange = (s: any): void => {
    if(_.isBoolean(s)) {
      props.onChange(s)
    }
  }

  const generate = () => {
    onChange(faker.random.boolean())
  }

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={generate}
      name={props.field.name}
      display={props.field.display}
      doGenerate={props.doGenerate}
      valid={false}
    >
      <div className="mt-1 ml-2" style={{
        flex: "1 1 auto"
      }}>
        <ReactForm.Check
          type="switch"
          label=""
          onChange={(e: any) => onChange(e.target.checked)}
          checked={props.field.value}
        />
      </div>
    </GenericField>
  )
}

type NumberFieldProps = {
  field   : t.TypeOf<typeof NumberFieldType>,
  onChange: (s: number) => void,
  doGenerate?: boolean | null
}

const NumberField = (props: NumberFieldProps) => {

  const onChange = (s: string): void => {
    const num = _.toNumber(s)
    if(!_.isNaN(num)) {
      props.onChange(num)
    }
  }

  const generate = () => {
    if(typeof props.field.generate === 'object' && 'min' in props.field.generate) {
      onChange(faker.random.float({
        min      : props.field.generate.min,
        max      : props.field.generate.max,
        precision: props.field.generate.precision
      }).toString())
    } else if(props.field.generate) {
      onChange(faker.random.float().toString())
    }
  }

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={generate}
      name={props.field.name}
      display={props.field.display}
      doGenerate={props.doGenerate}
      valid={false}
    >
      <ReactForm.Control type="input" onChange={e => onChange(e.target.value)} value={props.field.value}/>
    </GenericField>
  )
}

type StringFieldProps = {
  field   : t.TypeOf<typeof StringFieldType>,
  onChange: (s: string) => void,
  doGenerate?: boolean | null
}

const StringField = (props: StringFieldProps) => {

  const generate = () => {
    if(typeof props.field.generate === "number") {
      props.onChange(faker.random.alpha({count: props.field.generate, upcase: false}))
    } else if(props.field.generate === "name") {
      props.onChange(faker.name.firstName())
    } else if(props.field.generate) {
      props.onChange(faker.random.alpha({count: 10, upcase: false}))
    }
    // FieldFunctions.generate(props.field)
  }

  return (
    <GenericField
      generate={!!props.field.generate}
      onGenerate={generate}
      name={props.field.name}
      display={props.field.display}
      doGenerate={props.doGenerate}
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
  doGenerate?: boolean | null,
  valid      : boolean
}

const GenericField: FunctionComponent<GenericFieldProps> = (props) => {

  React.useEffect(() => {
    if(!_.isUndefined(props.doGenerate)) {
      if(typeof props.doGenerate === "boolean") {
        props.onGenerate()
      }
    }
  }, [props.doGenerate]);

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
  doGenerate?: boolean | null
}

const FormField = (props: FormFieldProps) => {
  if(props.field.type === "string") {
    return (
      <StringField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        doGenerate={props.doGenerate}
      />
    )
  } else if(props.field.type === "number") {
    return (
      <NumberField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        doGenerate={props.doGenerate}
      />
    )
  } else if(props.field.type === "boolean") {
    return (
      <BooleanField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        doGenerate={props.doGenerate}
      />
    )
  } else if(props.field.type === "select") {
    return (
      <SelectField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        doGenerate={props.doGenerate}
      />
    )
  } else if(props.field.type === "select-multi") {
    return (
      <SelectMultiField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        doGenerate={props.doGenerate}
      />
    )
  } else if(props.field.type === "date") {
    return (
      <DateField
        field={props.field}
        onChange={a => props.onChange(props.field.name, a)}
        doGenerate={props.doGenerate}
      />
    )
  } else {
    return (
      <div>Unknown field</div>
    )
  }
}

export default FormField