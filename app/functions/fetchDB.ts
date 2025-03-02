export interface questions {
    _id: string;
    question: string;
    question_sanitized: string;
    answer: string;
    answer_sanitized: string;
}

export const fetchDBQuestions = async ({difficulties, categories}:any ): Promise<questions[]> => {
    let url = `https://qbreader.org/api/query?randomize=true`
    if(difficulties !== undefined){
        url += `&difficulties=${difficulties}`;
    }
    if(categories !== undefined){
        url += `&categories=${categories}`;
    }

    console.log(url)
    const response = await fetch(url);
    const data = await response.json();
    const questions = data.tossups.questionArray.slice(0, 1);
    return questions;
}