const dropzone = document.getElementById('dropzone');
const imageInput = document.getElementById('imageInput');
const selectButton = document.getElementById('selectButton');
const classifyButton = document.getElementById('classifyButton');
const preview = document.getElementById('preview');
const result = document.getElementById('result');

let selectedFile = null;

function setLoading(isLoading) {
	classifyButton.disabled = isLoading || !selectedFile;
	classifyButton.textContent = isLoading ? 'Classifying…' : 'Classify';
}

function showMessage(message, type = 'info') {
	result.innerHTML = '';
	const div = document.createElement('div');
	div.className = `message ${type}`;
	div.textContent = message;
	result.appendChild(div);
}

function showPrediction(prediction) {
	result.innerHTML = '';
	const card = document.createElement('div');
	card.className = 'prediction-card';

	const label = document.createElement('div');
	label.className = 'prediction-label';
	label.textContent = prediction.label ?? 'Unknown';

	const confidence = document.createElement('div');
	confidence.className = 'prediction-confidence';
	if (typeof prediction.confidence === 'number') {
		confidence.textContent = `${(prediction.confidence * 100).toFixed(2)}% confidence`;
	} else if (prediction.probability) {
		confidence.textContent = `${(prediction.probability * 100).toFixed(2)}% confidence`;
	} else {
		confidence.textContent = '';
	}

	card.appendChild(label);
	card.appendChild(confidence);
	result.appendChild(card);
}

function setPreview(file) {
	if (!file) return;
	selectedFile = file;
	const objectUrl = URL.createObjectURL(file);
	preview.src = objectUrl;
	preview.style.display = 'block';
	classifyButton.disabled = false;
}

// Click to choose
selectButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', (e) => {
	const file = e.target.files?.[0];
	if (!file) return;
	setPreview(file);
});

// Drag and drop
['dragenter', 'dragover'].forEach(eventName => {
	dropzone.addEventListener(eventName, (e) => {
		e.preventDefault();
		e.stopPropagation();
		dropzone.classList.add('is-dragover');
	});
});
['dragleave', 'drop'].forEach(eventName => {
	dropzone.addEventListener(eventName, (e) => {
		e.preventDefault();
		e.stopPropagation();
		dropzone.classList.remove('is-dragover');
	});
});

dropzone.addEventListener('drop', (e) => {
	const dt = e.dataTransfer;
	if (!dt) return;
	const file = dt.files?.[0];
	if (!file) return;
	if (!file.type.startsWith('image/')) {
		showMessage('Please drop a valid image file.', 'error');
		return;
	}
	setPreview(file);
});

// Classify button
classifyButton.addEventListener('click', async () => {
	if (!selectedFile) return;
	setLoading(true);
	showMessage('Sending image to classifier…', 'info');
	try {
		const formData = new FormData();
		formData.append('image', selectedFile);

		const response = await fetch('/api/classify', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(text || `Request failed with status ${response.status}`);
		}

		const data = await response.json();
		// Expected shape: { label: string, confidence: number } OR { prediction: {label, confidence} }
		const prediction = data.prediction ?? data;
		showPrediction(prediction);
	} catch (err) {
		console.error(err);
		showMessage(`Error: ${err.message || 'Failed to classify image.'}`, 'error');
	} finally {
		setLoading(false);
	}
});