const USER_SCRIPTS = {
  'scroll-to-bottom': {
    title: '(Example) Scroll to bottom',
    script: () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  },
  'save-to-pinboard': {
    title: '(Example) Save to Pinboard',
    script: () => {
      // https://pinboard.in/howto/#saving
      q=location.href;if(document.getSelection){d=document.getSelection();}else{d='';};p=document.title;void(open('https://pinboard.in/add?url='+encodeURIComponent(q)+'&description='+encodeURIComponent(d)+'&title='+encodeURIComponent(p),'Pinboard','toolbar=no,width=700,height=350'));
    }
  }
}