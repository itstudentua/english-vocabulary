import * as XLSX from 'xlsx'

export function generateCSV(resultArray: string[]): void {
	const data: string[][] = resultArray.map(el => [el])

	const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data)

	const csv: string = XLSX.utils.sheet_to_csv(worksheet)

	saveAsCSVFile(csv, 'new_vocabulary.csv')
}

function saveAsCSVFile(csv: string, fileName: string): void {
	const blob: Blob = new Blob([csv], {
		type: 'text/csv;charset=utf-8;',
	})

	const link: HTMLAnchorElement = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = fileName
	link.click()
}
