document.addEventListener('shortcutkey2url-run-script', (e) => {
    const script = document.createElement('script')
    script.textContent = e.detail
    document.body.appendChild(script)
    document.body.removeChild(script)
});
