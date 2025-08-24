function wordsMorphology(wordsString: string[]) {
	const exclusionList = `us as thus yes Is Was Does Has His This News Means Series Analysis Lens famous serious focus james charles wales thesis crisis achilles venus sirius moses jesus thomas lewis harris curious obvious photosynthesis bus goes`
	
	const vowelLetters = 'aeiou'
	return wordsString.map((el:any) => {
		// removing "'s" from words
		if (
			el.endsWith("'s") ||
			el.endsWith("s'") ||
			el.endsWith("'m") ||
			el.endsWith("'d")
		) {
			return el.slice(0, -2)
		}
		if (el.endsWith("'ve") || el.endsWith("'re") || el.endsWith("'ll")) {
			return el.slice(0, -3)
		}
		// removing 'not' from words
		else if (el.endsWith("'t") && (el === "can't" || el === "won't")) {
			// exception for can't and won't
			return el.split("'t").join('')
		} else if (el.endsWith("n't")) {
			return el.split("n't").join('')
		} else if (el.endsWith('s')) {
			if (exclusionList.toLowerCase().includes(el)) {
				return el
			} else if (el.endsWith('ies')) {
				return el.slice(0, -3).concat('y')
			} else if (el.endsWith('ves')) {
				if (!vowelLetters.includes(el[el.length - 4])) {
					return el.slice(0, -3).concat('f')
				} else {
					return el
				}
			} else if (el.endsWith('ess')) {
				return el
			} else if (el.endsWith('ses')) {
				return el.slice(0, -2)
			} else if (el.endsWith('shes')) {
				return el.slice(0, -2)
			} else {
				return el.slice(0, -1)
			}
		} else {
			return el
		}
	})
}

export function splitStringFunc(textToSplit: string) {
	return wordsMorphology(
		textToSplit
			.toLowerCase()
			.match(
				/[^\d\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+(?:[-'][^\d\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+)*/g
			) || []
	)
}

export const makeUniq = (arr: string[]) => {
	const uniqSet = new Set(arr) // unique list
	return [...uniqSet]
}

export function uniqueElementsNotInFirst(arr1: string[], arr2: string[]) {
	return arr2.filter(element => !arr1.includes(element))
}
