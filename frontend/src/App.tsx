import { useState, useEffect } from 'react'
import { useCallback } from 'react'
import type { ChangeEventHandler } from 'react'

import { useGoogleSheet } from './GoogleSheet'
import {
	splitStringFunc,
	makeUniq,
	uniqueElementsNotInFirst,
} from './WordsProcessing'
import { generateCSV } from './GenerateCSV'

const API_URL = import.meta.env.VITE_BACKEND_URL

export default function App() {
	const [text, setText] = useState('')

	// backend
	const [newWords, setNewWords] = useState([])
	const [allWords, setAllWords] = useState([])
	const [uniqWords, setUniqWords] = useState([])
	const [showToast, setShowToast] = useState(false)
	const [server, setServer] = useState(false)

	const [isBack, setIsBack] = useState<boolean>(false)

	const setBack: ChangeEventHandler<HTMLInputElement> = event => {
		setIsBack(event.target.checked)
	}

	useEffect(() => {
		if (text.trim()) {
			handleProcess(text)
		} else {
			setNewWords([])
			setAllWords([])
			setUniqWords([])
		}
	}, [text])

	const handleProcess = async (txt: string) => {
		try {
			const res = await fetch(`${API_URL}/process`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: txt }),
			})

			if (!res.ok) {
				console.error('Request error', res.status)
				return
			}

			const data = await res.json()
			setServer(true)
			if (isBack) {
				setNewWords(data.new_words || [])
				setAllWords(data.all_words || [])
				setUniqWords(data.uniq_words || [])
			}
		} catch (err) {
			setServer(false)
			console.error('Fetch error:', err)
		}
	}

	//frontend with googleSheet
	const { googleWords } = useGoogleSheet()
	
	const [wordsFront, setWordsFront] = useState<string[]>([])

	const [allWordsFront, setAllWordsFront] = useState<string[]>([])
	const [uniqWordsFront, setUniqWordsFront] = useState<string[]>([])
	const [newWordsFront, setNewWordsFront] = useState<string[]>([])

	useEffect(() => {
		const saved = localStorage.getItem('googleWords')
		if (saved) {
			try {
				setWordsFront(JSON.parse(saved))
			} catch (e) {
				console.error('Parsing error localStorage', e)
			}
		}
	}, [])

	useEffect(() => {
			console.log(googleWords)

		if (googleWords && googleWords.length > 0) {
			setWordsFront(googleWords)
			localStorage.setItem('googleWords', JSON.stringify(googleWords))
		}
	}, [googleWords])

	const processWords = useCallback(() => {
		const tempArr = splitStringFunc(text)
		const uniqWordsArr = makeUniq(tempArr)
		const googleWordsNew = wordsFront.map(
			(item: string) => item.split(',')[0]
		)
		const resultArray = uniqueElementsNotInFirst(
			googleWordsNew,
			uniqWordsArr
		)

		setAllWordsFront(tempArr)
		setUniqWordsFront(uniqWordsArr)
		setNewWordsFront(resultArray)

		//setWordsInfo([tempArr.length, userWordsArr.length, resultArray])
	}, [text, wordsFront])

	useEffect(() => processWords(), [processWords, text])

	const handleDownload = () => {
		newWords.length > 0
			? window.open(`${API_URL}/download-csv`, '_blank')
			: generateCSV(newWordsFront)
	}

	const insertWords = async () => {
		try {
			console.log(wordsFront.length);
			
			const res = await fetch(`${API_URL}/insert-words`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(wordsFront),
			})

			if (!res.ok) {
				console.error('Request error', res.status)
				return
			}
		} catch (err) {
			console.error('Fetch error:', err)
		}
	}

	return (
		<>
			<div className='w-full h-full flex flex-col items-center justify-center'>
				<h1 className='text-3xl sm:text-5xl font-bold mb-5'>
					English Vocabular
					<span onClick={() => insertWords()}>y</span>
				</h1>
				<div className='w-full max-w-3xl mx-auto flex flex-col justify-center items-center'>
					<textarea
						className='w-full rounded-3xl border-2 border-[#222222] p-4 resize-none focus:outline-none focus:ring-0 text-xl'
						rows={10}
						value={text}
						onChange={e => setText(e.target.value)}
					/>
					{/* <button
					onClick={() => handleProcess(text)}
					className='text-white px-4 py-2 mt-2'
				>
					Process
				</button> */}
					{wordsFront.length === 0 && <p>Loading Google sheet...</p>}

					<div>
						<label className='cursor-pointer'>
							<input
								className='mr-1 cursor-pointer'
								type='checkbox'
								checked={isBack}
								onChange={setBack}
							/>
							{isBack ? 'From DataBase' : 'From Google Sheet'}
						</label>
					</div>

					{!server && isBack && (
						<p>Server with Golang still loading...</p>
					)}
					{(newWords.length > 0 || newWordsFront.length > 0) && (
						<div className='flex gap-2 flex-wrap justify-center'>
							<button
								className='my-2 bg-green-500 text-white px-4 py-2 rounded'
								onClick={() => {
									let textToCopy = ''
									if (newWords.length > 0 && isBack) {
										textToCopy = newWords.join('\n')
									}
									if (newWordsFront.length > 0) {
										textToCopy = newWordsFront.join('\n')
									}
									if (textToCopy === '') {
										return
									}
									navigator.clipboard
										.writeText(textToCopy)
										.then(() => {
											setShowToast(true)
											setTimeout(
												() => setShowToast(false),
												2000
											) // авто скрытие через 2 сек
										})
										.catch(err => {
											console.error(
												'Failed to copy: ',
												err
											)
										})
								}}
							>
								Copy new Vocabulary
							</button>
							<button className='my-2' onClick={handleDownload}>
								Download CSV
							</button>
						</div>
					)}
					{showToast && (
						<div className='fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg'>
							✅ Copied to clipboard!
						</div>
					)}
					{(allWords.length > 0 || allWordsFront.length > 0) && (
						<>
							<p>
								All words:{' '}
								{allWords.length > 0
									? allWords.length
									: allWordsFront.length}
							</p>
							<p>
								Unique words:{' '}
								{allWords.length > 0
									? uniqWords.length
									: uniqWordsFront.length}
							</p>

							<p>
								New words:{' '}
								{allWords.length > 0
									? newWords.length
									: newWordsFront.length}
							</p>
						</>
					)}

					{(newWords.length > 0 || newWordsFront.length > 0) && (
						<>
							<h2 className='mt-4 font-bold'>
								New vocabulary list:
							</h2>
							<ul>
								{isBack ? newWords.map((w, i) => (
									<li key={i}>{w}</li>
								)) : newWordsFront.map((w, i) => (
									<li key={i}>{w}</li>
								))}
							</ul>
						</>
					)}
				</div>
			</div>
		</>
	)
}
