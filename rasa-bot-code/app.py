from multiprocessing import Process, freeze_support
import time
from flask import Flask, send_from_directory
from flask_cors import CORS
import os
import sys
import sys
import time
from multiprocessing import Process
from waitress import serve
import subprocess
import webview
import socket
import threading
import tkinter as tk
from tkhtmlview import HTMLLabel

def create_window(html_content):
    root = tk.Tk()
    root.title("Tkinter Webview")
    html_label = HTMLLabel(root, html="<h1>Hello, Tkinter with HTML!</h1>")
    html_label.pack()
    root.mainloop()

def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

# -------------------------------------------
# Config Files
# -------------------------------------------
if getattr(sys, 'frozen', False): 
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

sys.path.append(BASE_DIR)

# -------------------------------------------
# Initializing Flask App
# -------------------------------------------

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'react-build'))

origins=["*"]

CORS(app, origins=origins, allow_headers=["Content-Type"] )

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith("_next/"):
        return send_from_directory(os.path.join(app.static_folder, '_next'), path[len("_next/"):])

    if "." not in path:
        path += ".html"
    file_path = os.path.join(app.static_folder, path)

    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)

    return "File not found", 404



import socket

def is_port_open(host, port):
    """Check if a port on the host is open."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(1.0)  # short timeout
        return sock.connect_ex((host, port)) == 0

def wait_for_ports(host, ports, timeout=1200):
    """Wait until all ports are open or timeout is reached."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if all(is_port_open(host, port) for port in ports):
            print("All required ports are up:", ports)
            return True
        time.sleep(1)
    print("Timeout reached. Some ports are still not open.")
    return False

def run_bot_server():
    print("Starting Rasa Hindi model on port 5045...")
    rasa_path = resource_path("./rasa_engine/rasa.exe") 
    rasa_model_hindi = resource_path("./models/hi") 
    rasa_model_english = resource_path("./models/en") 

    hi_process = subprocess.Popen([
        rasa_path, "run", 
        "--enable-api", 
        "--cors", "*", 
        "--port", "5045", 
        "--model", rasa_model_hindi
    ])

    print("Starting Rasa English model on port 5046...")
    en_process = subprocess.Popen([
        rasa_path, "run", 
        "--enable-api", 
        "--cors", "*", 
        "--port", "5046", 
        "--model", rasa_model_english
    ])

    hi_process.wait()  

    print("Hindi model server stopped.")
    en_process.wait()  

    print("English model server stopped.")

def run_frontend():
    app.run(host='0.0.0.0', port=5044, debug=False, use_reloader=False)

def launch_webview():
    window = webview.create_window('Loading...', html=open(resource_path('loading.html'), 'r').read())
    
    def check_and_load_frontend():
        if wait_for_ports("localhost", [5044, 5045, 5046]):
            print("All ports are up. Loading frontend...")
            with open(resource_path("ready-bot.html"), 'r') as f:
                frontend_html = f.read()
            
            webview.windows[0].load_html(frontend_html)
        else:
            print("Error: Not all services started correctly.")

    threading.Thread(target=check_and_load_frontend).start()
    webview.start()
    
if __name__ == '__main__':
    
    freeze_support()
     # Start Flask frontend (React) in a separate process
    bot_process = Process(target=run_bot_server)
    bot_process.start()
    print("1: Serving run_bot_server process.")

    # # Start the backend in a separate process
    frontend_process = Process(target=run_frontend)
    frontend_process.start()
    print("2: Serving frontend_process.")
    # Wait a bit to ensure the backend is running
    time.sleep(2)
    # Wait until all servers are ready
    launch_webview()
    

    print("All processes exited.")
