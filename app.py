import streamlit as st

st.title("Health Tracker")

st.write("Streamlit is working!")

message = st.chat_input("Message")

if message:
    with st.chat_message("user"):
        st.write(message)

    with st.chat_message("assistant"):
        st.write(f"Received: {message}")