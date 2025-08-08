def commit_callback(commit):
    if commit.author_email == b"fon1@example.com" or commit.author_email == b"developer@classroomapp.com":
        commit.author_name = b"tu1en"
        commit.author_email = b"thinhcche171897@fpt.edu.vn"
    if commit.committer_email == b"fon1@example.com" or commit.committer_email == b"developer@classroomapp.com":
        commit.committer_name = b"tu1en"
        commit.committer_email = b"thinhcche171897@fpt.edu.vn"
