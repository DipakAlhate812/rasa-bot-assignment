# Set the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy your application code into the container
COPY . /app

# Create a virtual environment
RUN python3 -m venv /opt/venv

# Install pip packages into the virtual environment
RUN /opt/venv/bin/pip install --no-cache-dir --upgrade pip setuptools
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Set the environment variable for Python to use the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Expose port 5005 for the Rasa API
EXPOSE 5005

# Command to run the bot
CMD ["rasa", "run", "--enable-api", "--cors", "*"]
