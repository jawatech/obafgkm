## PDF.js & ePub viewer in Electron app, incoporating a http server that receives commands from emacs

* Open PDF.js & ePub viewer in Electron
* Disable nodeIntegration and webSecurity
* Using ipc to communicate within electron between main / renderer threads
* Using http server to receive commands issued from emacs that controls pdf.js
* Adapted from https://github.com/seanchas116/electron-pdfjs
## Installation
### emacs shortcuts
     (org-add-link-type "pdfbmk" 'org-pdf-jump2 'org-pdf-export)
     (org-add-link-type "epubbmk" 'org-epub-jump2 nil)
     (org-add-link-type "mpv" 'org-mpv-jump2 nil)
     (setq adobe-prog2 "C:\\Progra~1\\Adobe\\Acroba~1\\Acrobat\\Acrobat.exe")
     
	(defun org-pdf-jump2 (bmk2)
	  (let* ((bmk (org-link-decode bmk2))(p1 (string-match (regexp-quote "=") bmk))
		(query (split-string bmk "&")) )
	    (message (concat (nth 0 query) " & " (nth 1 query)))
	  (condition-case e
	      (if p1 (skk-url-retrieve (concat pdfjs-url "gotobmk?file=" bmk) 'utf-8)
		(if (string-match (regexp-quote "[") bmk) (skk-url-retrieve (concat pdfjs-url "gotobmk?file=" (nth 0 query) "&explicitDest=" (nth 1 query)) 'utf-8)
					     (skk-url-retrieve (concat pdfjs-url "gotobmk?file=" (nth 0 query) "&nameddest=" (nth 1 query)) 'utf-8)
		    )
	      )
	    (file-error
	     (if p1 (start-process-shell-command "my-process" "foo" (concat  " \"" httpd-root "/" bmk "\""))
	      (start-process-shell-command "my-process" "foo" (concat adobe-prog2 " /A \"" "nameddest=" (nth 1 query) "\" \"" (expand-file-name (concat httpd-root "/" (nth 0 query))) "\"")) 
	       )
	     (message "obafgkm not started!! fall back to vanilla browser.")
	    ))
	  ))
	  
	(defun org-epub-jump2 (bmk2)
	  (let* ((bmk (org-link-decode bmk2))
		 (query (split-string bmk "#")) )
	    (message (concat (nth 0 query) " # " (nth 1 query)))
	  (condition-case e
		  (skk-url-retrieve (concat pdfjs-url "gotobmk2?bookPath=" (nth 0 query) "&hash=" (nth 1 query)) 'utf-8)
	    (file-error
	     (message "obafgkm not started!!")
	    ))
	))
	
	(defun org-mpv-jump2 (bmk2)
	  (let* ((bmk (org-link-decode bmk2))(p1 (string-match (regexp-quote "#") bmk))
		(query (split-string bmk "#")) )
	    (message (concat (nth 0 query) " # " (nth 1 query)))
	  (condition-case e
	      (if p1 (skk-url-retrieve (concat pdfjs-url "gotompv?file=" (nth 0 query) "&start=" (nth 1 query)) 'utf-8)
	      )
	    (file-error
	     (if p1      
		 (start-process-shell-command "mvp-process" "mvp-buffer"
					      (concat  "mpv --script=~/Dropbox/obafgkm/copyTime.js --start=+" (nth 1 query)  " https://www.youtube.com/watch?v=" (nth 0 query)))
		 (start-process-shell-command "mvp-process" "mvp-buffer"
					      (concat  "mpv --start=+" (nth 1 query)  " https://www.youtube.com/watch?v=" (nth 0 query) ))
	       )
	     (message "obafgkm not started!! fall back to mpv, a media player based on MPlayer and mplayer2.")
	    ))
	))

	(defun skk-url-retrieve (url coding-system)
	  "URL を取得する。戻り値は decode-coding-string である."
	  (let (buf p)
	    (message (concat "url: " url))
	    (unwind-protect
		(progn
		  (setq buf (let (
				  (url-request-method "GET")
				  (url-max-redirextions 0))
			      (url-retrieve-synchronously url))) ; return BUFFER contain data
		  (when (setq p (url-http-symbol-value-in-buffer
				 'url-http-end-of-headers buf))
		    (with-current-buffer buf
		      (decode-coding-string (buffer-substring (1+ p)
							      (point-max))
					    coding-system))))
	      (when buf
		(kill-buffer buf)))))
		
	(defun skk-url-retrieve2 (url coding-system)
	  "URL を取得する。戻り値は decode-coding-string である."
	  (let (buf p)
	    (message (concat "url: " url))
	    (unwind-protect
		(progn
		  (setq buf (let (
				  (url-request-method "GET")
				  (url-max-redirextions 0))
			      (url-retrieve-synchronously url))) ; return BUFFER contain data
		  (when (setq p (url-http-symbol-value-in-buffer
				 'url-http-end-of-headers buf))
		    (with-current-buffer buf
		      (decode-coding-string (buffer-substring (1+ p)
							      (point-max))
					    coding-system))))
	      (when buf
		(kill-buffer buf)))))
