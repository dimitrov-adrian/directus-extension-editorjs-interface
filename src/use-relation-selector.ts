import { ref } from 'vue';

export type SelectionSaveHandler = (relation: number[]) => void;

export default function useRelationSelector() {
	const open = ref<boolean>(false);
	const currentSelection = ref<number[] | null>(null);
	const selectionSaveHandler = ref<SelectionSaveHandler | null>(null);

	function setCurrentSelection(relation: number[] | undefined | null) {
		currentSelection.value = relation || null;
	}

	function toggleOpen() {
		open.value = !open.value
	}

	function unsetSelectionSaveHandler() {
		selectionSaveHandler.value = null;
		currentSelection.value = null;
	}

	function setSelectionSaveHandler(handler: SelectionSaveHandler) {
		selectionSaveHandler.value = handler;
	}

	function handleSelectionSave(selection: number[]) {
		if (selectionSaveHandler.value) {
			selectionSaveHandler.value(selection);
		}

		unsetSelectionSaveHandler();
	}

	return {
		currentSelection,
		setCurrentSelection,
		open,
		toggleOpen,
		setSelectionSaveHandler,
		handleSelectionSave
	};
}
