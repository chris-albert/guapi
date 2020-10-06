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
  DateField as DateFieldType
} from "../data/Types"
import { Form as ReactForm, InputGroup, Button } from "react-bootstrap";
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

  const [value, setValue] = React.useState<Date | string | undefined>(
    typeof props.field.value === 'string' ?
      props.field.value:
      undefined
  )

  const onChange = (s: Moment | string): void => {
    if(isMoment(s)) {
      setValue(s.toDate())
      props.onChange(s.format(props.field.format))
    } else {
      setValue(s)
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
    >
      <div style={{
        flex: "1 1 auto"
      }}>
        <Datetime onChange={onChange} dateFormat={props.field.format} timeFormat={false} value={value} input={true}/>
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

  const [values, setValues] = React.useState<{value: string, label: string}[] | undefined>(() => {
    return _.compact(_.map(props.field.items, item => {
      const val =  _.find(props.field.value, v => item.name === v)
      if(_.isUndefined(val)) {
        return undefined
      } else {
        return {
          value: item.name,
          label: item.display
        }
      }
    }))
  })

  const options = _.map(props.field.items, item => {
    return {
      value: item.name,
      label: item.display
    }
  })

  const onChange = (s: any): void => {
    setValues(s)
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

  const [value, setValue] = React.useState<{value: string, label: string} | undefined>(() => {
    const val =  _.find(props.field.items, i => i.name === props.field.value)
    if(_.isUndefined(val)) {
      return undefined
    } else {
      return {
        value: val.name,
        label: val.display
      }
    }
  })

  const options = _.map(props.field.items, item => {
    return {
      value: item.name,
      label: item.display
    }
  })

  const onChange = (s: any): void => {
    setValue(s)
    props.onChange(s.value)
  }

  const element = !_.isUndefined(props.field.creatable) && props.field.creatable ?
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

  const [value, setValue] = React.useState<boolean>(
    typeof props.field.value === 'boolean' ?
      props.field.value :
      false
  )

  const onChange = (s: any): void => {
    if(_.isBoolean(s)) {
      setValue(s)
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
    >
      <div style={{
        flex: "1 1 auto"
      }}>
        <ReactForm.Check
          type="checkbox"
          onChange={(e: any) => onChange(e.target.checked)}
          checked={value}
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
    >
      <ReactForm.Control type="input" onChange={e => onChange(e.target.value)} value={value}/>
    </GenericField>
  )
}

type StringFieldProps = {
  field   : t.TypeOf<typeof StringFieldType>,
  onChange: (s: string) => void,
  doGenerate?: boolean | null
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

  const generate = () => {
    if(typeof props.field.generate === "number") {
      onChange(faker.random.alpha({count: props.field.generate, upcase: false}))
    } else if(props.field.generate === "name") {
      onChange(faker.name.firstName())
    } else if(typeof props.field.generate === "boolean" && props.field.generate) {
      onChange(faker.random.alpha({count: 10, upcase: false}))
    }
  }

  return (
    <GenericField
      generate={!_.isUndefined(props.field.generate)}
      onGenerate={generate}
      name={props.field.name}
      display={props.field.display}
      doGenerate={props.doGenerate}
    >
      <ReactForm.Control type="input" onChange={e => onChange(e.target.value)} value={value}/>
    </GenericField>
  )
}

type GenericFieldProps = {
  generate  : boolean,
  onGenerate: () => void,
  name      : string,
  display   : string,
  doGenerate?: boolean | null
}

const GenericField: FunctionComponent<GenericFieldProps> = (props) => {

  React.useEffect(() => {
    if(!_.isUndefined(props.doGenerate)) {
      if(typeof props.doGenerate === "boolean") {
        props.onGenerate()
      }
    }
  }, [props.doGenerate]);

  return (
    <ReactForm.Group controlId={`form-basic-${props.name}`}>
      <ReactForm.Label className="font-weight-bold">{props.display}</ReactForm.Label>
      <InputGroup size="sm">
        {props.children}
        {props.generate ?
          (<InputGroup.Append>
            <Button variant="secondary" onClick={props.onGenerate}><Shuffle/></Button>
          </InputGroup.Append>) : (<span></span>)
        }
      </InputGroup>
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
      <NumberField field={props.field} onChange={a => props.onChange(props.field.name, a)} doGenerate={props.doGenerate}/>
    )
  } else if(props.field.type === "boolean") {
    return (
      <BooleanField field={props.field} onChange={a => props.onChange(props.field.name, a)} doGenerate={props.doGenerate}/>
    )
  } else if(props.field.type === "select") {
    return (
      <SelectField field={props.field} onChange={a => props.onChange(props.field.name, a)} doGenerate={props.doGenerate}/>
    )
  } else if(props.field.type === "select-multi") {
    return (
      <SelectMultiField field={props.field} onChange={a => props.onChange(props.field.name, a)} doGenerate={props.doGenerate}/>
    )
  } else if(props.field.type === "date") {
    return (
      <DateField field={props.field} onChange={a => props.onChange(props.field.name, a)} doGenerate={props.doGenerate}/>
    )
  } else {
    return (
      <div>Unknown field</div>
    )
  }
}

export default FormField