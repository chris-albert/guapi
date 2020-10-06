import _ from "lodash"

const Generator = {
  generateString: (length: number) => {

    return "asdf"
  },
  generateNumber: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  },
  generateBoolean: (): boolean => {
    return Math.random() <= .5
  }
}

export default Generator