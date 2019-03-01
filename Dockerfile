FROM tools-barebone

MAINTAINER Giovanni Pizzi <giovanni.pizzi@epfl.ch>

COPY ./config.yaml /home/app/code/webservice/static/config.yaml
COPY ./user_requirements.txt /home/app/code/user_requirements.txt
COPY ./optional-requirements.txt /home/app/code/optional-requirements.txt
COPY ./setup.py /home/app/code/setup.py
COPY ./README.rst /home/app/code/README.rst
COPY ./user_templates/* /home/app/code/webservice/templates/user_templates/
COPY ./user_static/ /home/app/code/webservice/user_static/
COPY ./compute/ /home/app/code/webservice/compute/
COPY ./.docker_files/ /home/app/code/.docker_files/

# Set proper permissions
RUN chown -R app:app $HOME

# Run this as sudo to replace the version of pip
RUN pip3 install -U 'pip>=10' setuptools wheel

# install rest of the packages as normal user (app, provided by passenger)
USER app

# Install SeeK-path
# Note: if you want to deploy with python3, use 'pip3' instead of 'pip'
WORKDIR /home/app/code

# Create a proper wsgi file file
#
ENV SP_WSGI_FILE=webservice/seekpath_app.wsgi
RUN echo "import sys" > $SP_WSGI_FILE && \
    echo "sys.path.insert(0, '/home/app/code/webservice')" >> $SP_WSGI_FILE && \
    echo "from seekpath_app import app as application" >> $SP_WSGI_FILE

# First install pinned versions of packages
RUN pip3 install --user -r optional-requirements.txt --only-binary numpy,scipy
# Then install the code without extra dependencies
RUN pip3 install --user .

# Go back to root.
# Also, it should remain as user root for startup
USER root

# Setup apache
# Disable default apache site, enable seekpath site; also
# enable needed modules
ADD .docker_files/seekpath-apache.conf /etc/apache2/sites-available/seekpath.conf
RUN a2enmod wsgi && a2enmod xsendfile && \
    a2dissite 000-default && a2ensite seekpath

# Activate apache at startup
#RUN mkdir /etc/service/apache
ADD ./.docker_files/apache_run.sh /etc/service/apache/run

# Set startup script to create the secret key
RUN mkdir -p /etc/my_init.d
ADD ./.docker_files/create_secret_key.sh /etc/my_init.d/create_secret_key.sh

# Web
EXPOSE 80

# Final cleanup, in case it's needed
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*