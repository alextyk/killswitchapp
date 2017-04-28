curl -Ls $(docker port  killswitchapp_ngrok_1 4040)/api/tunnels/command_line | python -c 'import sys, json; print json.load(sys.stdin)["public_url"]'
