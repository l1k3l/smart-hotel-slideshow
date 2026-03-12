<script lang="ts">
	let {
		value = '',
		onchange
	}: {
		value: string;
		onchange: (url: string) => void;
	} = $props();

	let uploading = $state(false);
	let errorMsg = $state('');
	let dragOver = $state(false);

	async function uploadFile(file: File) {
		uploading = true;
		errorMsg = '';

		const formData = new FormData();
		formData.append('file', file);

		try {
			const resp = await fetch('/api/admin/upload', {
				method: 'POST',
				body: formData
			});

			if (!resp.ok) {
				const data = await resp.json().catch(() => ({ message: 'Upload failed' }));
				throw new Error(data.message ?? `HTTP ${resp.status}`);
			}

			const { url } = await resp.json();
			onchange(url);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) uploadFile(file);
		input.value = '';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			uploadFile(file);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleRemove() {
		onchange('');
	}

	function handleUrlInput(e: Event) {
		const input = e.target as HTMLInputElement;
		onchange(input.value);
	}
</script>

<div class="image-upload">
	{#if value}
		<div class="preview">
			<img src={value} alt="Preview" />
			<button class="remove-btn" onclick={handleRemove} aria-label="Remove image">&#x2715;</button>
		</div>
	{:else}
		<div
			class="drop-zone"
			class:drag-over={dragOver}
			class:uploading
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			role="button"
			tabindex="0"
		>
			{#if uploading}
				<span class="upload-text">Uploading...</span>
			{:else}
				<span class="upload-text">Drop image here or click to upload</span>
				<span class="upload-hint">JPEG, PNG, WebP, GIF - Max 5 MB</span>
			{/if}
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				class="file-input"
				onchange={handleFileInput}
				disabled={uploading}
			/>
		</div>
	{/if}

	<div class="url-row">
		<input
			type="text"
			value={value}
			oninput={handleUrlInput}
			placeholder="Or paste image URL..."
			class="url-input"
		/>
	</div>

	{#if errorMsg}
		<div class="upload-error">{errorMsg}</div>
	{/if}
</div>

<style>
	.image-upload {
		margin-bottom: 8px;
	}

	.preview {
		position: relative;
		display: inline-block;
		margin-bottom: 8px;
	}

	.preview img {
		max-width: 200px;
		max-height: 140px;
		border-radius: 8px;
		border: 1px solid #334155;
		object-fit: cover;
	}

	.remove-btn {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 22px;
		height: 22px;
		background: #ef4444;
		color: #fff;
		border: 2px solid #0f172a;
		border-radius: 50%;
		font-size: 0.7rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.drop-zone {
		position: relative;
		border: 2px dashed #334155;
		border-radius: 8px;
		padding: 24px;
		text-align: center;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		margin-bottom: 8px;
	}

	.drop-zone:hover,
	.drop-zone.drag-over {
		border-color: #3b82f6;
		background: rgba(59, 130, 246, 0.05);
	}

	.drop-zone.uploading {
		border-color: #f59e0b;
		cursor: wait;
	}

	.upload-text {
		display: block;
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.upload-hint {
		display: block;
		color: #475569;
		font-size: 0.75rem;
		margin-top: 4px;
	}

	.file-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.url-row {
		display: flex;
		gap: 8px;
	}

	.url-input {
		width: 100%;
		max-width: 500px;
		padding: 8px 12px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 8px;
		color: #f1f5f9;
		font-size: 0.85rem;
	}

	.url-input:focus {
		outline: none;
		border-color: #3b82f6;
	}

	.upload-error {
		color: #ef4444;
		font-size: 0.8rem;
		margin-top: 4px;
	}
</style>
