.PHONY: help mulch-record

help:
	@echo "Conscius repo targets:"
	@echo "  make mulch-record  — interactive Mulch lesson recorder (wraps ml/mulch record)"
	@echo "  make help          — show this message"

mulch-record:
	@bash "$(CURDIR)/scripts/mulch-record-interactive.sh"
