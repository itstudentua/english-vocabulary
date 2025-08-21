import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_BACKEND_URL

export default function App() {
	const [text, setText] = useState('')
	const [newWords, setNewWords] = useState([])
	const [allWords, setAllWords] = useState([])
	const [uniqWords, setUniqWords] = useState([])
	const [showToast, setShowToast] = useState(false)

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
				console.error('Ошибка запроса', res.status)
				return
			}

			const data = await res.json()
			setNewWords(data.new_words || [])
			setAllWords(data.all_words || [])
			setUniqWords(data.uniq_words || [])
		} catch (err) {
			console.error('Fetch error:', err)
		}
	}

	// скачивание CSV
	const handleDownload = () => {
		// просто открываем ссылку на бекенд
		window.open(`${API_URL}/download-csv`, '_blank')
	}

	return (
		<div className='w-full h-full flex flex-col items-center justify-center'>
			<h1 className='text-3xl sm:text-5xl font-bold mb-5'>English Vocabulary</h1>
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
				{newWords.length > 0 && (
					<div className='flex gap-2 flex-wrap justify-center'>
						<button
							className='my-2 bg-green-500 text-white px-4 py-2 rounded'
							onClick={() => {
								if (newWords.length === 0) return

								const textToCopy = newWords.join('\n')
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
										console.error('Failed to copy: ', err)
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
				<p>All words: {allWords.length}</p>
				<p>New words: {newWords.length}</p>
				<p>Unique words: {uniqWords.length}</p>

				{newWords.length > 0 && (
					<>
						<h2 className='mt-4 font-bold'>New vocabulary list:</h2>
						<ul>
							{newWords.map((w, i) => (
								<li key={i}>{w}</li>
							))}
						</ul>
					</>
				)}
			</div>
		</div>
	)
}
