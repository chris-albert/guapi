import React from "react";
import { Card, Button } from "react-bootstrap";
import JsonEditor from "./JsonEditor";
import { StorageKey } from '../util/Storage'
import { Form } from "../data/Types"
import { PathReporter } from 'io-ts/PathReporter'
import { isRight } from 'fp-ts/lib/Either'

const storage = StorageKey("config")

const Config = () => {

  const [content, setContent] = React.useState<string>(storage.getOrEmpty())

  const save = () => {
    storage.save(content)
    const result = Form.decode(JSON.parse(content))

    if(isRight(result)) {
      console.log("Success")
    } else {
      console.log(PathReporter.report(result));
    }
  }

  const onChange = (content: string): void => {
    setContent(content)
    storage.save(content)
  }

  return (
    <Card>
      <Card.Header>GUAPI Config</Card.Header>
      <Card.Body className="p-0">
        <JsonEditor content={content} readOnly={false} onChange={onChange}/>
      </Card.Body>
      <Card.Footer>
        <Button variant="success" size="sm" onClick={save}>Save</Button>{' '}
        <Button variant="info" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
      </Card.Footer>
    </Card>
  )
}

export default Config