module Api
  module V1
    # Catch-all for unknown `/api` routes.
    class ErrorsController < ActionController::API
      include ExceptionHandler

      def show
        exception = request.get_header("action_dispatch.exception")
        raise exception if exception

        handle_not_found(nil)
      end
    end
  end
end
