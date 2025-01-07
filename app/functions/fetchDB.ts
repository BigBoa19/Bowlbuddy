export interface questions {
    _id: string;
    question: string;
    question_sanitized: string;
    answer: string;
    answer_sanitized: string;
}

export const fetchDBQuestions = async (queryString: string): Promise<questions[]> => {
    const response = await fetch(`https://qbreader.org/api/query?queryString=${queryString}&randomize=true`);
    const data = await response.json();
    const questions = data.tossups.questionArray.slice(0, 10);
    return questions;
}

export const fetchDBQuestionsNoSearch = async (): Promise<questions[]> => {
    const response = await fetch(`https://www.qbreader.org/api/query?difficulties=3&randomize=true`);
    const data = await response.json();
    const questions = data.tossups.questionArray.slice(0, 10);

    return questions;
}