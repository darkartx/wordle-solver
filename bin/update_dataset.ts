import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse'

const DATASET_URL = 'https://raw.githubusercontent.com/dkulagin/kartaslov/master/dataset/kartaslovsent/kartaslovsent.csv'
const DATASET_FILE_PATH = '../dataset.csv'
const PROCESSED_DATASET_FILE_PATH = '../src/assets/dataset.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function downloadDataset(): Promise<string> {
  return new Promise((resolve, _) => {
    const filepath = path.join(__dirname, DATASET_FILE_PATH)

    console.log(`Downloading ${DATASET_URL} to ${filepath}`)
    const file = fs.createWriteStream(filepath)

    const request = https.get(DATASET_URL, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('Download completed')
        resolve(filepath)
      })
    })
  })
}

function processDataset(filepath: string): Promise<string[]> {
  return new Promise((resolve, _) => {
    console.log(`Processing dataset ${filepath}`)
  
    const dataset = new Set<string>

    fs.createReadStream(filepath)
      .pipe(parse({ delimiter: ';', columns: true }))
      .on('data', (row) => {
        const term = row.term.toLocaleLowerCase().replace(/[^а-я]/gi, '').replace('ё', 'е')
        if (term.length == 5) dataset.add(term)
      })
      .on('end', () => {
        console.log('Processing done')
        resolve(Array.from(dataset))
      })
  })
}

function saveDataset(dataset: string[]): Promise<void> {
  return new Promise((resolve, _) => {
    const filepath = path.join(__dirname, PROCESSED_DATASET_FILE_PATH)
    console.log(`Saving dataset ${filepath}`)  

    fs.writeFile(filepath, JSON.stringify(dataset), (err) => {
      if (err) throw err
      console.log('Saving done')
      resolve()
    })
  })
}

downloadDataset().then((filename) => processDataset(filename))
                 .then((dataset) => saveDataset(dataset))
                 .then(() => {})