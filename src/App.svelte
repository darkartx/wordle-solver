<script lang="ts">
  import dataset from './assets/dataset.json'
  import { WordleResolver } from './lib/WordleResolver'

  type PredictTry = { word: string, hits: number[] }

  const resolver = new WordleResolver(dataset)

  function calculateHits(predicted: string, word: string): number[] {
    return predicted.split('').map((letter, index) => {
      if (word[index] == letter) return 1
      if (word.includes(letter)) return 0
      return -1
    })
  }

  function resolve(resolver: WordleResolver, word: string) {
    const tries: PredictTry[] = []
    let iterations = 10

    while (iterations > 0) {
      iterations--

      const predicted = resolver.predict(tries)

      console.log('----------------------')
      console.log(word)
      console.log(predicted)
      console.log(tries)

      tries.push({
        word: predicted,
        hits: calculateHits(predicted, word)
      })

      if (word == predicted) {
        console.log('----------- DONE ------------')
        return
      }
    }
  }

  const word = 'перст'
  resolve(resolver, word)
</script>

<main>
</main>
