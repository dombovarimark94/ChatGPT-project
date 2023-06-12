using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using OpenAI_API;
using OpenAI_API.Completions;
using OpenAI_API.Models;
using System.Net;

namespace ChatGPT_project.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatGPTController : ControllerBase
    {
        private static List<string> conversationHistory = new List<string>();
        private readonly OpenAIAPI openAI;
        private const int MaxConversationLength = 8;
        private readonly string apiKey;

        public ChatGPTController(IConfiguration configuration)
        {
            apiKey = configuration.GetValue<string>("OpenAI:ApiKey");
            openAI = new OpenAIAPI(apiKey);
        }

        [EnableCors("AllowAllOrigins")]
        [HttpGet]
        [Route("UseChatGPT")]
        public async Task<IActionResult> UseChatGPT(string query, [FromServices] IConfiguration configuration)
        {
            if (string.IsNullOrEmpty(apiKey))
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, "API key not provided in the configuration file.");
            }

            conversationHistory.Add(query);

            if (conversationHistory.Count > MaxConversationLength)
            {
                conversationHistory = conversationHistory.Skip(conversationHistory.Count - MaxConversationLength).ToList();
            }

            CompletionRequest completionRequest = new CompletionRequest();
            completionRequest.Prompt = string.Join("\n", conversationHistory);
            completionRequest.Model = Model.DavinciText;
            completionRequest.MaxTokens = 1000;

            string outputResult = string.Empty;

            try
            {
                var completions = await openAI.Completions.CreateCompletionAsync(completionRequest);

                outputResult = completions.Completions.FirstOrDefault()?.Text;
            }
            catch (Exception ex)
            {
                conversationHistory.RemoveAt(conversationHistory.Count - 1);

                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error occurred: {ex.Message}");
            }

            if (!string.IsNullOrEmpty(outputResult))
            {
                conversationHistory.Add(outputResult);
            }

            return new ContentResult
            {
                Content = outputResult,
                ContentType = "text/plain",
                StatusCode = (int)HttpStatusCode.OK
            };
        }
    }
}
