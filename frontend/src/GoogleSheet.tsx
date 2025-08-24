import { useState, useEffect } from 'react'

const GoogleMacrosURL = import.meta.env.VITE_GOOGLE_MACROS_URL

export function useGoogleSheet() {
	const [googleWords, setGoogleWords] = useState([])

	useEffect(function () {

		const controller = new AbortController()

		async function fetchWords() {
			try {
				const res = await fetch(GoogleMacrosURL, {
					signal: controller.signal,
				})

				if (!res.ok)
					throw new Error('Something went wrong with fetching movies')

				const data = await res.json()
				if (data.Response === 'False')
					throw new Error('Movie not found')

				const helpArray = data.map((el: any) => {
					return typeof el[0] === 'boolean'
						? // записываем данные из гуглшит через запятую, [слово, перевод]; потом в таблице будем разделять с помощью split()
                        el[0].toString() + ',' + el[1]
						: el[0] + ',' + el[1]
					// true and false are always boolean type at google sheets
				})

				setGoogleWords(() => helpArray.filter((item: any) => item !== '')) // remove '' item);
			} catch (err: any) {
				if (err.name !== 'AbortError') {
					console.log(err.message)
				}
			}
		}

		fetchWords()

		return function () {
			controller.abort()
		}
	}, [])

	return { googleWords }
}
