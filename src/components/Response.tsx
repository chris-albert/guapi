import React from "react";
import { Badge, Card, Spinner } from "react-bootstrap";
import JsonEditor from "./JsonEditor";
import {Option, some, none, isSome} from "fp-ts/Option";
import {Either, isRight} from "fp-ts/Either";
import {AxiosResponse} from "axios";

type ResponseProps = {
  response: Option<Either<any, AxiosResponse<any>>>,
  loading : boolean
}

const Response = (props: ResponseProps) => {

  const [content   , setContent]    = React.useState<Option<object>>(none)
  const [statusCode, setStatusCode] = React.useState<Option<number>>(none)

  React.useEffect(() => {
    if(isSome(props.response)) {
      if(isRight(props.response.value)) {
        setStatusCode(some(props.response.value.right.status))
        if(typeof props.response.value.right.data === "object") {
          setContent(some(props.response.value.right.data))
        } else {
          setContent(some({
            message: "Result parse error",
            error  : props.response.value.right.data
          }))
        }
      } else {
        if(typeof props.response.value.left.response === "object" &&
          typeof props.response.value.left.response.status === "number") {
          setStatusCode(some(props.response.value.left.response.status))
        }
        if(typeof props.response.value.left.response === "object" &&
          typeof props.response.value.left.response.data === "object") {
          setContent(some(props.response.value.left.response.data))
        } else {
          console.log(props.response.value.left.response)
          setContent(some({
            message: "Request error",
            error: props.response.value.left
          }))
        }
      }
    }
  }, [props.response])

  const statusBadgeProps: ["success" | "danger" | "dark", number] = isSome(statusCode) ?
    (
      statusCode.value < 400 ?
        ["success", statusCode.value]:
        ["danger", statusCode.value]
    ) :
    ["dark", 0]

  const statusBadge = <Badge
    className="float-right"
    variant={statusBadgeProps[0]}
  >
    {statusBadgeProps[1]}
  </Badge>

  const body =
    props.loading ?
      <div className="text-center">
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      </div>:
      (isSome(content) ?
        <JsonEditor
          content={JSON.stringify(content.value, null, 2)}
          readOnly={true}
          onChange={() => null} /> :
        <div>Nothing yet</div>)

  return (
    <Card border={statusBadgeProps[0]}>
      <Card.Header>
        Response
        {statusBadge}
      </Card.Header>
      <Card.Body>
        {body}
      </Card.Body>
    </Card>
  )
}

export default Response
