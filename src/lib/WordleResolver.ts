type LetterWeights = { [key:string]: number }
type WordWeight = [string, number]
export type PredictTry = { word: string, hits: number[] }

function calculateLetterWeights(dataset: string[]): LetterWeights {
  const datasetLength = dataset.length
  const result = dataset.reduce((weights, word) => {
    return Array.from(new Set(word.split(''))).reduce((weights, letter) => {
      if (!weights[letter]) weights[letter] = 1
      else weights[letter] += 1

      return weights
    }, weights)
  }, {})

  Object.keys(result).forEach((key) => {
    result[key] /= datasetLength
  })

  return result
}

function calculateWordWeight(word: string, weights: LetterWeights): number {
  return Array.from(new Set(word.split(''))).reduce((result, letter) => {
    return result + weights[letter]
  }, 0)
}

type LatterAnalizeData = { exectly: string, disallow: string }

class PredictTriesAnalyzer {
  constructor(private tries_: PredictTry[]) { }

  public buildRegexp(): RegExp {
    const analysis = this.analize()

    const reString = analysis.map((item) => {
      if (item.exectly) return item.exectly
      if (item.disallow) return `[^${item.disallow}]`
      return '.'
    }).reduce((result, item) => result + item, '^') + '$'

    console.log(analysis)
    console.log(reString)

    return new RegExp(reString)
  }

  private analize(): LatterAnalizeData[] {
    const result = [
      { exectly: '', disallow: new Set<string> },
      { exectly: '', disallow: new Set<string> },
      { exectly: '', disallow: new Set<string> },
      { exectly: '', disallow: new Set<string> },
      { exectly: '', disallow: new Set<string> }
    ]

    return this.tries_.reduce((result, item) => {
      item.word.split('').forEach((letter, index) => {
        if (item.hits[index] < 0) {
          result.forEach((resultItem) => resultItem.disallow.add(letter))
        } else if (item.hits[index] > 0) {
          result[index].exectly = letter
        } else {
          result[index].disallow.add(letter)
        }
      })

      return result
    }, result).map((item) => ({ 
      ...item,
      disallow: Array.from(item.disallow).reduce((str, a) => str + a, '')
    }))
  }
}

export class WordleResolver {
  private wordWeights: WordWeight[]

  constructor(dataset: string[]) {
    this.updateWeights_(dataset)
  }

  public predict(tries: PredictTry[]): string {
    // if (!tries) return this.wordWeights[0][0]
    // if (tries.length <= 3) {
    //   const match = this.searchLettersPredict_(tries)
    //   if (match) return match[0]
    // }

    const analizer = new PredictTriesAnalyzer(tries)
    return this.getWordByRegexp_(analizer.buildRegexp())[0]
  }

  private updateWeights_(dataset) {
    const letterWeights = calculateLetterWeights(dataset)

    this.wordWeights = dataset.map((word) => {
      return [word, calculateWordWeight(word, letterWeights)]
    }).sort((a, b) => b[1] - a[1])
  }

  private getWordByRegexp_(re: RegExp): WordWeight | null {
    return this.wordWeights.find((item) => {
      return item[0].match(re)
    })
  }

  private searchLettersPredict_(tries: PredictTry[]): WordWeight | null {
    const usedLetters = Array.from(tries.reduce((result, item) => {
      return item.word.split('').reduce((result, letter) => {
        result.add(letter)
        return result
      }, result)
    }, new Set<string>))

    const re = new RegExp(`^[^${usedLetters.join('')}]{5}$`)

    return this.wordWeights.find((item) => {
      return item[0].match(re)
    })
  }
}