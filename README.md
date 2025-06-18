# Pipeline Workflow in ExpressJs

## Overview
The Pipeline Workflow provides a structured approach to executing sequential operations, ensuring safe execution flow, error resilience, and efficient logging. Built around [Neverthrow's](https://www.npmjs.com/package/neverthrow) Result type, it enhances error handling by distinguishing between successful and failed outcomes, thereby maintaining system consistency. The workflow stores intermediate results, allowing easy access to previous steps without unnecessary recomputation.

## Benefits
- Structured Execution Flow: Each step runs independently, reducing dependencies and making workflows predictable.
- Enhanced Error Handling: Uses PipelineWorkflowException to detect failures early, preventing cascading errors.
- Robust Logging & Monitoring: Provides detailed step-level logs (START, OK, ERROR, EXCEPTION) for better debugging.
- Stateful Context Management: Stores step results for later retrieval, ensuring seamless data flow between operations.
- Type-Safe Execution: Ensures correctness through Result<TResult, ResultError>, reducing ambiguity in error handling.
- Scalability & Maintainability: Easily extendable, allowing dynamic step registration while preserving execution safety.

This workflow is ideal for transactional operations, API request handling, and multi-step processing, ensuring clarity, efficiency, and maintainability. 🚀

## Setup
To set up Pusher Channels in your environment:
- Create a Pusher Account: Sign up at [Pusher](https://pusher.com/) and create an application.
- Obtain Configuration Details: After setup, retrieve your App ID, Key, Secret, and Cluster from the Pusher dashboard.

### Note: 
The Pipeline Workflow is focused on structured execution of sequential operations and does not directly relate to [Pusher](https://pusher.com/) or real-time messaging solutions.

#### Project Setup
- Clone the Repository
```bash
git clone <your-repo-url>
cd <your-project-directory>
``` 
- Setup `util` Service
    - Move into the util solution and create an .env file:
    ```bash
    NODE_ENV=development
    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Build the utility package:
    ```bash
    npm run build
    ```
    - Link the package:
    ```bash
    npm link
    ```
- Setup `api` Service
    - Move into the api solution and create an .env file:
    ```bash
    NODE_ENV=development
    PORT=3000

    # Logging
    LOG_FORMAT=dev
    LOG_DIR=logs

    # CORS Config
    ORIGIN=*
    CREDENTIALS=true

    # PUSHER
    PUSHER_APP_ID=APP_ID
    PUSHER_KEY=KEY
    PUSHER_SECRET=SECRET
    PUSHER_CLUSTER=CLUSTER

    # Rate Limiter
    RATE_LIMITER=1000
    ```
    - Install dependencies:
    ```bash
    npm i
    ```
    - Link the `util` package:
    ```bash
    npm link <utilurl>
    ```
    - Build the Api service:
    ```bash
    npm run build
    ```
    - Run the API in development mode:
    ```bash
    npm run dev
    ```

    #### Example Link
    - Services
    https://github.com/KishorNaik/Sol_pipeline_workflow_expressJs/tree/main/api/src/modules/producers/apps/features/v1/pubSubDemo/endpoint/services
    - Endpoint
    https://github.com/KishorNaik/Sol_pipeline_workflow_expressJs/blob/main/api/src/modules/producers/apps/features/v1/pubSubDemo/endpoint/index.ts

    #### Helper
    https://github.com/KishorNaik/Sol_pipeline_workflow_expressJs/tree/main/utils/src/core/shared/utils/helpers/workflow