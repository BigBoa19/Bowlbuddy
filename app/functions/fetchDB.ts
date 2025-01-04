export interface questions {
    _id: string;
    question: string;
    question_sanitized: string;
    answer: string;
    answer_sanitized: string;
}

export const fetchDBQuestions = async (queryString: string): Promise<questions[]> => {
    const response = await fetch(`https://qbreader.org/api/query?queryString=${queryString}`);
    const data = await response.json();
    const questions = data.tossups.questionArray
    return questions;
}