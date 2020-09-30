import * as t from 'io-ts'
import { Either, left, right, isRight } from "fp-ts/Either";
import { StorageKey } from "../util/Storage";
import { Interaction, Config } from "./Types"
import {PathReporter} from "io-ts/PathReporter";

const storage = StorageKey("config")

const ConfigProvider = {
  config: (): Either<Array<string>, t.TypeOf<typeof Config>> => {
    const res = storage.getOrEmpty()
    const form = Interaction.decode(JSON.parse(res))
    if(isRight(form)) {
      return right({interactions: [form.right]})
    } else {
      return left(PathReporter.report(form))
    }
  }
}

export default ConfigProvider