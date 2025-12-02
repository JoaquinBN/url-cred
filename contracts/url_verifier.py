# { "Depends": "py-genlayer:latest" }

from genlayer import *
import json

@allow_storage
class VerificationResult:
    url: str
    timestamp: str
    status_code: u256
    is_accessible: bool
    error_message: str
    query: str
    content_found: bool
    concise_answer: str
    analysis: str

    def __init__(
        self,
        url: str,
        timestamp: str,
        status_code: u256,
        is_accessible: bool,
        error_message: str,
        query: str = "",
        content_found: bool = False,
        concise_answer: str = "",
        analysis: str = ""
    ):
        self.url = url
        self.timestamp = timestamp
        self.status_code = status_code
        self.is_accessible = is_accessible
        self.error_message = error_message
        self.query = query
        self.content_found = content_found
        self.concise_answer = concise_answer
        self.analysis = analysis

    def to_dict(self) -> dict:
        return {
            "url": self.url,
            "timestamp": self.timestamp,
            "status_code": self.status_code,
            "is_accessible": self.is_accessible,
            "error_message": self.error_message,
            "query": self.query,
            "content_found": self.content_found,
            "concise_answer": self.concise_answer,
            "analysis": self.analysis
        }

class UrlVerifier(gl.Contract):
    verifications: DynArray[VerificationResult]

    def __init__(self):
        pass

    def _normalize_url(self, url: str) -> str:
        """Normalize URL to ensure proper format."""
        url = url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url
        return url

    @gl.public.write
    def process_url(self, url: str, query: str = "", force_refresh: bool = False) -> dict:
        normalized_url = self._normalize_url(url)
        
        existing_index = -1
        for i in range(len(self.verifications)):
            if self.verifications[i].url == normalized_url and self.verifications[i].query == query:
                existing_index = i
                break
        
        if existing_index != -1 and not force_refresh:
            return self.verifications[existing_index].to_dict()

        current_time = gl.message_raw["datetime"]

        def leader_fn() -> str:
            try:
                content = gl.nondet.web.render(normalized_url, mode='text')
                
                if not query:
                    result = {
                        "status_code": 200,
                        "is_accessible": True,
                        "error_message": "",
                        "content_found": True,
                        "concise_answer": "Page accessible",
                        "analysis": "URL is accessible and content was retrieved."
                    }
                else:
                    prompt = f"""
                    Analyze the following content based on this query: '{query}'.
                    Return a JSON object with the following fields:
                    - content_found: boolean, true if the answer to the query is found in the content.
                    - concise_answer: string, a very short and direct answer to the query (e.g., "$85,000"). If not found, say "Not found".
                    - analysis: string, a brief explanation or context.
                    
                    Content:
                    {content[:10000]}
                    """
                    llm_result = gl.nondet.exec_prompt(prompt, response_format='json')
                    
                    result = {
                        "status_code": 200,
                        "is_accessible": True,
                        "error_message": "",
                        "content_found": llm_result.get("content_found", False),
                        "concise_answer": llm_result.get("concise_answer", "Not found"),
                        "analysis": llm_result.get("analysis", "")
                    }

            except Exception as e:
                error_str = str(e)
                status_code = 0
                
                # Simple parsing for common status codes in error messages
                if "403" in error_str:
                    status_code = 403
                elif "404" in error_str:
                    status_code = 404
                elif "500" in error_str:
                    status_code = 500
                elif "502" in error_str:
                    status_code = 502
                elif "503" in error_str:
                    status_code = 503
                
                result = {
                    "status_code": status_code,
                    "is_accessible": False,
                    "error_message": error_str,
                    "content_found": False,
                    "concise_answer": "Error",
                    "analysis": ""
                }
            return json.dumps(result)

        fetched_json = gl.eq_principle.prompt_comparative(
            leader_fn,
            principle="The result must accurately reflect the content and answer the query concisely. If the URL is inaccessible, it should report the error."
        )
        fetched_data = json.loads(fetched_json)

        new_result = VerificationResult(
            url=normalized_url,
            timestamp=current_time,
            status_code=u256(fetched_data["status_code"]),
            is_accessible=fetched_data["is_accessible"],
            error_message=fetched_data["error_message"],
            query=query,
            content_found=fetched_data["content_found"],
            concise_answer=fetched_data["concise_answer"],
            analysis=fetched_data["analysis"]
        )

        if existing_index != -1:
            self.verifications[existing_index] = new_result
        else:
            self.verifications.append(new_result)

        return new_result.to_dict()

    @gl.public.view
    def get_verifications(self) -> list[dict]:
        return [v.to_dict() for v in self.verifications]
