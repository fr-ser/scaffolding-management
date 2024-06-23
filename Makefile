# command to list available commands with a preceeding comment (requires "#:")
help: 
	@ echo '  Usage:'
	@ echo '    make <target>'
	@ echo ''
	@ echo '  Targets:'
	@grep -B1 -E "^[a-zA-Z0-9_-]+\:([^\=]|$$)" Makefile \
		| grep -v -- -- \
		| sed 'N;s/\n/###/' \
		| sed -n 's/^#: \(.*\)###\(.*\):.*/\2:###\1/p' \
		| column -t -s '###'

#: installs dependencies (backend and frontend)
install:
	cd backend && npm install
	cd frontend && npm install

#: start the backend
start-backend:
	cd backend && npm run dev

#: start the frontend
start-frontend:
	cd frontend && npm run dev
